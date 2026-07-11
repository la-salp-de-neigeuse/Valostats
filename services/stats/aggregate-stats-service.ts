import type { AggregatePeriod } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import { formatAgentName } from "@/lib/valorant/agents";
import { getOrSet } from "@/lib/cache/cache-service";
import { statsKey, agentStatsKey, mapStatsKey, TTL } from "@/lib/cache/keys";

export type StatsPeriod = "7d" | "30d" | "all";

export function mapPeriodToAggregate(period: StatsPeriod): AggregatePeriod {
  switch (period) {
    case "7d":
      return "LAST_7_DAYS";
    case "30d":
      return "LAST_30_DAYS";
    case "all":
      return "ALL_TIME";
    default:
      return "ALL_TIME";
  }
}

export interface AggregateStats {
  period: StatsPeriod;
  matchCount: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  kdRatio: number;
  headshotRate: number;
  damagePerRound: number;
  combatScore: number;
  firstDeathRate: number;
  attackWinRate: number;
  defenseWinRate: number;
  utilityPerRound: number;
  mainAgent: {
    agentName: string;
    agentDisplayName: string;
    matchCount: number;
  } | null;
  bestMap: string | null;
  worstMap: string | null;
  rankProgressValue: number;
}

export interface AgentAggregate {
  agentName: string;
  agentDisplayName: string;
  matchCount: number;
  winRate: number;
  averageKda: number;
  damagePerRound: number;
}

export interface MapAggregate {
  mapName: string;
  matchCount: number;
  winRate: number;
  attackWinRate: number;
  defenseWinRate: number;
  averageKda: number;
}

const EMPTY_AGGREGATE_STATS: AggregateStats = {
  period: "all",
  matchCount: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
  averageKills: 0,
  averageDeaths: 0,
  averageAssists: 0,
  kdRatio: 0,
  headshotRate: 0,
  damagePerRound: 0,
  combatScore: 0,
  firstDeathRate: 0,
  attackWinRate: 0,
  defenseWinRate: 0,
  utilityPerRound: 0,
  mainAgent: null,
  bestMap: null,
  worstMap: null,
  rankProgressValue: 0,
};

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export async function getAggregateStatsByPeriod(
  userId: string,
  period: StatsPeriod = "all"
): Promise<AggregateStats> {
  return getOrSet(
    statsKey(userId, period),
    async () => {
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
      losses: true,
      kills: true,
      deaths: true,
      assists: true,
      winRate: true,
      averageKda: true,
      headshotRate: true,
      damagePerRound: true,
      combatScore: true,
      firstDeathRate: true,
      attackWinRate: true,
      defenseWinRate: true,
      utilityPerRound: true,
      mainAgent: true,
      bestMap: true,
      worstMap: true,
      aiScore: true,
      rankProgressValue: true,
      rank: true,
      rankTier: true,
      computedAt: true,
    },
  });

  if (!aggregate || aggregate.matchCount === 0) {
    return { ...EMPTY_AGGREGATE_STATS, period };
  }

  const totalMatches = aggregate.matchCount;
  const totalKills = aggregate.kills;
  const totalDeaths = aggregate.deaths;

  return {
    period,
    matchCount: totalMatches,
    wins: aggregate.wins,
    losses: aggregate.losses,
    draws: totalMatches - aggregate.wins - aggregate.losses,
    winRate: Number(aggregate.winRate),
    averageKills: round(totalKills / totalMatches, 1),
    averageDeaths: round(totalDeaths / totalMatches, 1),
    averageAssists: round(aggregate.assists / totalMatches, 1),
    kdRatio: totalDeaths > 0 ? round(totalKills / totalDeaths, 2) : round(totalKills, 2),
    headshotRate: Number(aggregate.headshotRate),
    damagePerRound: Number(aggregate.damagePerRound),
    combatScore: Number(aggregate.combatScore),
    firstDeathRate: Number(aggregate.firstDeathRate),
    attackWinRate: Number(aggregate.attackWinRate),
    defenseWinRate: Number(aggregate.defenseWinRate),
    utilityPerRound: Number(aggregate.utilityPerRound),
    mainAgent: aggregate.mainAgent
      ? {
          agentName: aggregate.mainAgent,
          agentDisplayName: formatAgentName(aggregate.mainAgent),
          matchCount: totalMatches,
        }
      : null,
    bestMap: aggregate.bestMap,
    worstMap: aggregate.worstMap,
    rankProgressValue: Number(aggregate.rankProgressValue),
  };
    },
    TTL.STATS_AGGREGATE,
  );
}

export async function getAgentAggregatesByPeriod(
  userId: string,
  period: StatsPeriod = "all"
): Promise<AgentAggregate[]> {
  return getOrSet(
    agentStatsKey(userId, period),
    async () => {
      const aggregatePeriod = mapPeriodToAggregate(period);

      const aggregates = await prisma.playerAgentAggregate.findMany({
        where: {
          userId,
          period: aggregatePeriod,
        },
        orderBy: { matchCount: "desc" },
      });

      return aggregates.map((agg) => ({
        agentName: agg.agentName,
        agentDisplayName: formatAgentName(agg.agentName),
        matchCount: agg.matchCount,
        winRate: Number(agg.winRate),
        averageKda: Number(agg.averageKda),
        damagePerRound: Number(agg.damagePerRound),
      }));
    },
    TTL.STATS_AGGREGATE,
  );
}

export async function getMapAggregatesByPeriod(
  userId: string,
  period: StatsPeriod = "all"
): Promise<MapAggregate[]> {
  return getOrSet(
    mapStatsKey(userId, period),
    async () => {
      const aggregatePeriod = mapPeriodToAggregate(period);

      const aggregates = await prisma.playerMapAggregate.findMany({
        where: {
          userId,
          period: aggregatePeriod,
        },
        orderBy: { matchCount: "desc" },
      });

      return aggregates.map((agg) => ({
        mapName: agg.mapName,
        matchCount: agg.matchCount,
        winRate: Number(agg.winRate),
        attackWinRate: Number(agg.attackWinRate),
        defenseWinRate: Number(agg.defenseWinRate),
        averageKda: Number(agg.averageKda),
      }));
    },
    TTL.STATS_AGGREGATE,
  );
}
