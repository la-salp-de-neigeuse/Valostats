import { prisma } from "@/lib/prisma/client";
import { isPremiumUser } from "@/services/subscription/subscription-service";
import { mapPeriodToAggregate } from "@/services/stats/aggregate-stats-service";
import type { StatsPeriod } from "@/services/stats/aggregate-stats-service";

export interface EvolutionBlock {
  label: string;
  matchCount: number;
  winRate: number;
  kdRatio: number;
}

export interface PeriodComparison {
  period: StatsPeriod;
  label: string;
  matchCount: number;
  winRate: number;
  kdRatio: number;
  aiScore: number | null;
}

export interface RecentMatchPoint {
  id: string;
  result: "WIN" | "LOSS" | "DRAW";
  kills: number;
  deaths: number;
  assists: number;
  kdRatio: number;
  agentName: string;
  mapName: string;
  playedAt: Date;
}

const BLOCK_SIZE = 10;

function kdRatio(kills: number, deaths: number): number {
  return deaths > 0 ? Math.round((kills / deaths) * 100) / 100 : kills;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export async function getEvolutionData(userId: string): Promise<EvolutionBlock[]> {
  const premium = await isPremiumUser(userId);
  if (!premium) return [];

  const matches = await prisma.playerMatchStats.findMany({
    where: { userId },
    orderBy: { matchStartedAt: "asc" },
    select: {
      result: true,
      kills: true,
      deaths: true,
      matchStartedAt: true,
    },
    take: 1_000,
  });

  if (matches.length < 2) return [];

  const totalBlocks = Math.ceil(matches.length / BLOCK_SIZE);
  const blocks: EvolutionBlock[] = [];

  for (let i = 0; i < totalBlocks; i++) {
    const start = i * BLOCK_SIZE;
    const end = Math.min(start + BLOCK_SIZE, matches.length);
    const slice = matches.slice(start, end);

    const wins = slice.filter((m) => m.result === "WIN").length;
    const totalKills = slice.reduce((sum, m) => sum + m.kills, 0);
    const totalDeaths = slice.reduce((sum, m) => sum + m.deaths, 0);

    const matchStart = start + 1;
    const matchEnd = end;

    blocks.push({
      label: `${matchStart}-${matchEnd}`,
      matchCount: slice.length,
      winRate: round((wins / slice.length) * 100, 1),
      kdRatio: kdRatio(totalKills, totalDeaths),
    });
  }

  return blocks;
}

export async function getPerformanceByPeriod(userId: string): Promise<PeriodComparison[]> {
  const premium = await isPremiumUser(userId);
  if (!premium) return [];
  const periods: StatsPeriod[] = ["7d", "30d", "all"];
  const labels: Record<StatsPeriod, string> = {
    "7d": "7 jours",
    "30d": "30 jours",
    all: "Global",
  };

  const results = await Promise.all(
    periods.map(async (period) => {
      const aggregatePeriod = mapPeriodToAggregate(period);

      const aggregate = await prisma.playerStatAggregate.findFirst({
        where: {
          userId,
          period: aggregatePeriod,
        },
        orderBy: { computedAt: "desc" },
        select: {
          matchCount: true,
          wins: true,
          kills: true,
          deaths: true,
          winRate: true,
          averageKda: true,
          aiScore: true,
        },
      });

      if (!aggregate || aggregate.matchCount === 0) {
        return null;
      }

      return {
        period,
        label: labels[period],
        matchCount: aggregate.matchCount,
        winRate: Number(aggregate.winRate),
        kdRatio: Number(aggregate.averageKda),
        aiScore: aggregate.aiScore !== null ? Number(aggregate.aiScore) : null,
      };
    })
  );

  return results.filter((r): r is PeriodComparison => r !== null);
}

export async function getRecentMatchesForChart(
  userId: string,
  limit: number = 15
): Promise<RecentMatchPoint[]> {
  const premium = await isPremiumUser(userId);
  if (!premium) return [];
  const matches = await prisma.playerMatchStats.findMany({
    where: { userId },
    orderBy: { matchStartedAt: "desc" },
    take: limit,
    select: {
      id: true,
      result: true,
      kills: true,
      deaths: true,
      assists: true,
      agentName: true,
      mapName: true,
      matchStartedAt: true,
    },
  });

  return matches.reverse().map((m) => ({
    id: String(m.id),
    result: m.result,
    kills: m.kills,
    deaths: m.deaths,
    assists: m.assists,
    kdRatio: kdRatio(m.kills, m.deaths),
    agentName: m.agentName,
    mapName: m.mapName,
    playedAt: m.matchStartedAt,
  }));
}
