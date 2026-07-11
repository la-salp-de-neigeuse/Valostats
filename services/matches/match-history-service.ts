import type { MatchResult, ValorantQueue } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import { formatAgentName } from "@/lib/valorant/agents";
import { isPremiumUser } from "@/services/subscription/subscription-service";

export type MatchHistoryItem = {
  id: string;
  result: MatchResult;
  mapName: string;
  agentName: string;
  agentDisplayName: string;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  durationSeconds: number;
  playedAt: Date;
  queue: ValorantQueue;
};

export type MatchHistoryResult = {
  matches: MatchHistoryItem[];
  total: number;
};

const DEFAULT_LIMIT = 50;

function toMatchHistoryItem(
  stat: {
    id: bigint;
    result: MatchResult;
    mapName: string;
    agentName: string;
    kills: number;
    deaths: number;
    assists: number;
    score: number;
    matchStartedAt: Date;
    match: {
      durationSeconds: number;
      queue: ValorantQueue;
    };
  },
): MatchHistoryItem {
  return {
    id: stat.id.toString(),
    result: stat.result,
    mapName: stat.mapName,
    agentName: stat.agentName,
    agentDisplayName: formatAgentName(stat.agentName),
    kills: stat.kills,
    deaths: stat.deaths,
    assists: stat.assists,
    score: stat.score,
    durationSeconds: stat.match.durationSeconds,
    playedAt: stat.matchStartedAt,
    queue: stat.match.queue,
  };
}

export async function getMatchHistoryForUser(
  userId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<MatchHistoryResult> {
  const limit = options.limit ?? DEFAULT_LIMIT;
  const offset = options.offset ?? 0;

  const premium = await isPremiumUser(userId);

  const where: Record<string, unknown> = { userId };

  if (!premium) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    where.matchStartedAt = { gte: thirtyDaysAgo };
  }

  const [stats, total] = await Promise.all([
    prisma.playerMatchStats.findMany({
      where,
      include: {
        match: {
          select: {
            durationSeconds: true,
            queue: true,
          },
        },
      },
      orderBy: { matchStartedAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.playerMatchStats.count({ where }),
  ]);

  return {
    matches: stats.map(toMatchHistoryItem),
    total,
  };
}
