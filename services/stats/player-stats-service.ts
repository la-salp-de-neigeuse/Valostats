import type { MatchResult } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import { formatAgentName } from "@/lib/valorant/agents";

export type PlayerStatsSummary = {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  kdRatio: number;
  mainAgent: {
    agentName: string;
    agentDisplayName: string;
    matchCount: number;
  } | null;
};

const EMPTY_STATS: PlayerStatsSummary = {
  totalMatches: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
  averageKills: 0,
  averageDeaths: 0,
  averageAssists: 0,
  kdRatio: 0,
  mainAgent: null,
};

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function countByResult(
  groups: Array<{ result: MatchResult; _count: { _all: number } }>,
): Pick<PlayerStatsSummary, "wins" | "losses" | "draws"> {
  let wins = 0;
  let losses = 0;
  let draws = 0;

  for (const group of groups) {
    if (group.result === "WIN") wins = group._count._all;
    if (group.result === "LOSS") losses = group._count._all;
    if (group.result === "DRAW") draws = group._count._all;
  }

  return { wins, losses, draws };
}

export async function getPlayerStatsSummary(userId: string): Promise<PlayerStatsSummary> {
  // Try to get from aggregate table first (ALL_TIME period)
  const aggregate = await prisma.playerStatAggregate.findFirst({
    where: {
      userId,
      period: "ALL_TIME",
    },
    orderBy: { computedAt: "desc" },
  });

  if (aggregate && aggregate.matchCount > 0) {
    const totalMatches = aggregate.matchCount;
    const totalKills = aggregate.kills;
    const totalDeaths = aggregate.deaths;

    return {
      totalMatches,
      wins: aggregate.wins,
      losses: aggregate.losses,
      draws: totalMatches - aggregate.wins - aggregate.losses,
      winRate: Number(aggregate.winRate),
      averageKills: round(totalKills / totalMatches, 1),
      averageDeaths: round(totalDeaths / totalMatches, 1),
      averageAssists: round(aggregate.assists / totalMatches, 1),
      kdRatio: totalDeaths > 0 ? round(totalKills / totalDeaths, 2) : round(totalKills, 2),
      mainAgent: aggregate.mainAgent
        ? {
            agentName: aggregate.mainAgent,
            agentDisplayName: formatAgentName(aggregate.mainAgent),
            matchCount: totalMatches,
          }
        : null,
    };
  }

  // Fallback to real-time calculation if no aggregate exists
  return getPlayerStatsSummaryRealtime(userId);
}

export async function getPlayerStatsSummaryRealtime(userId: string): Promise<PlayerStatsSummary> {
  const [resultGroups, aggregates, agentGroups] = await Promise.all([
    prisma.playerMatchStats.groupBy({
      by: ["result"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.playerMatchStats.aggregate({
      where: { userId },
      _count: { _all: true },
      _avg: { kills: true, deaths: true, assists: true },
      _sum: { kills: true, deaths: true },
    }),
    prisma.playerMatchStats.groupBy({
      by: ["agentName"],
      where: { userId },
      _count: { _all: true },
      orderBy: { _count: { agentName: "desc" } },
    }),
  ]);

  const totalMatches = aggregates._count._all;

  if (totalMatches === 0) {
    return EMPTY_STATS;
  }

  const { wins, losses, draws } = countByResult(resultGroups);
  const totalKills = aggregates._sum.kills ?? 0;
  const totalDeaths = aggregates._sum.deaths ?? 0;

  const topAgent = agentGroups[0];

  return {
    totalMatches,
    wins,
    losses,
    draws,
    winRate: round((wins / totalMatches) * 100, 1),
    averageKills: round(aggregates._avg.kills ?? 0, 1),
    averageDeaths: round(aggregates._avg.deaths ?? 0, 1),
    averageAssists: round(aggregates._avg.assists ?? 0, 1),
    kdRatio: totalDeaths > 0 ? round(totalKills / totalDeaths, 2) : round(totalKills, 2),
    mainAgent: topAgent
      ? {
          agentName: topAgent.agentName,
          agentDisplayName: formatAgentName(topAgent.agentName),
          matchCount: topAgent._count._all,
        }
      : null,
  };
}
