import type { AggregatePeriod } from "@prisma/client";
import { SyncJobType } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";

export interface AggregationWindow {
  period: AggregatePeriod;
  windowStart: Date;
  windowEnd: Date;
}

function getAggregationWindow(period: AggregatePeriod): AggregationWindow {
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setHours(23, 59, 59, 999);

  let windowStart: Date;
  switch (period) {
    case "LAST_7_DAYS":
      windowStart = new Date(now);
      windowStart.setDate(now.getDate() - 7);
      windowStart.setHours(0, 0, 0, 0);
      break;
    case "LAST_30_DAYS":
      windowStart = new Date(now);
      windowStart.setDate(now.getDate() - 30);
      windowStart.setHours(0, 0, 0, 0);
      break;
    case "ALL_TIME":
      windowStart = new Date(0);
      break;
    case "ACT":
    case "SEASON":
      // For now, treat ACT/SEASON as ALL_TIME
      // TODO: Implement proper ACT/SEASON logic based on Valorant act dates
      windowStart = new Date(0);
      break;
    default:
      windowStart = new Date(0);
  }

  return { period, windowStart, windowEnd };
}

async function calculatePlayerStatAggregate(
  userId: string,
  window: AggregationWindow,
): Promise<{
  matchCount: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  averageKda: number;
  winRate: number;
  headshotRate: number;
  damagePerRound: number;
  combatScore: number;
  firstDeathRate: number;
  attackWinRate: number;
  defenseWinRate: number;
  utilityPerRound: number;
  mainAgent: string | null;
  bestMap: string | null;
  worstMap: string | null;
  rankProgressValue: number;
}> {
  const { windowStart, windowEnd } = window;

  const [resultGroups, aggregates, agentGroups, mapGroups] = await Promise.all([
    prisma.playerMatchStats.groupBy({
      by: ["result"],
      where: {
        userId,
        matchStartedAt: { gte: windowStart, lte: windowEnd },
      },
      _count: { _all: true },
    }),
    prisma.playerMatchStats.aggregate({
      where: {
        userId,
        matchStartedAt: { gte: windowStart, lte: windowEnd },
      },
      _count: { _all: true },
      _avg: {
        kills: true,
        deaths: true,
        assists: true,
        headshotRate: true,
        damagePerRound: true,
        combatScore: true,
        utilityCasts: true,
        roundsPlayed: true,
      },
      _sum: {
        kills: true,
        deaths: true,
        assists: true,
        firstDeaths: true,
        openingDuelsTaken: true,
        attackRoundsWon: true,
        attackRoundsPlayed: true,
        defenseRoundsWon: true,
        defenseRoundsPlayed: true,
        utilityCasts: true,
        roundsPlayed: true,
      },
    }),
    prisma.playerMatchStats.groupBy({
      by: ["agentName"],
      where: {
        userId,
        matchStartedAt: { gte: windowStart, lte: windowEnd },
      },
      _count: { _all: true },
      orderBy: { _count: { agentName: "desc" } },
    }),
    prisma.playerMatchStats.groupBy({
      by: ["mapName"],
      where: {
        userId,
        matchStartedAt: { gte: windowStart, lte: windowEnd },
      },
      _count: { _all: true },
      orderBy: { _count: { mapName: "desc" } },
    }),
  ]);

  const matchCount = aggregates._count._all;

  if (matchCount === 0) {
    return {
      matchCount: 0,
      wins: 0,
      losses: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      averageKda: 0,
      winRate: 0,
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
  }

  let wins = 0;
  let losses = 0;

  for (const group of resultGroups) {
    if (group.result === "WIN") wins = group._count._all;
    if (group.result === "LOSS") losses = group._count._all;
  }

  const totalKills = aggregates._sum.kills ?? 0;
  const totalDeaths = aggregates._sum.deaths ?? 0;
  const totalAssists = aggregates._sum.assists ?? 0;
  const totalFirstDeaths = aggregates._sum.firstDeaths ?? 0;
  const totalOpeningDuelsTaken = aggregates._sum.openingDuelsTaken ?? 0;
  const totalAttackRoundsWon = aggregates._sum.attackRoundsWon ?? 0;
  const totalAttackRoundsPlayed = aggregates._sum.attackRoundsPlayed ?? 0;
  const totalDefenseRoundsWon = aggregates._sum.defenseRoundsWon ?? 0;
  const totalDefenseRoundsPlayed = aggregates._sum.defenseRoundsPlayed ?? 0;
  const totalUtilityCasts = aggregates._sum.utilityCasts ?? 0;
  const totalRoundsPlayed = aggregates._sum.roundsPlayed ?? 0;

  const averageKda = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
  const winRate = (wins / matchCount) * 100;
  const headshotRate = Number(aggregates._avg.headshotRate ?? 0);
  const damagePerRound = Number(aggregates._avg.damagePerRound ?? 0);
  const combatScore = Number(aggregates._avg.combatScore ?? 0);
  const firstDeathRate = totalOpeningDuelsTaken > 0 ? (totalFirstDeaths / totalOpeningDuelsTaken) * 100 : 0;
  const attackWinRate = totalAttackRoundsPlayed > 0 ? (totalAttackRoundsWon / totalAttackRoundsPlayed) * 100 : 0;
  const defenseWinRate = totalDefenseRoundsPlayed > 0 ? (totalDefenseRoundsWon / totalDefenseRoundsPlayed) * 100 : 0;
  const utilityPerRound = totalRoundsPlayed > 0 ? totalUtilityCasts / totalRoundsPlayed : 0;

  // Simple rank progress: based on win rate and KDA
  const rankProgressValue = winRate * 0.6 + (averageKda * 10) * 0.4;

  const mainAgent = agentGroups[0]?.agentName ?? null;

  // Find best and worst maps by win rate
  const mapsWithStats = await Promise.all(
    mapGroups.map(async (group) => {
      const wins = await prisma.playerMatchStats.count({
        where: {
          userId,
          mapName: group.mapName,
          result: "WIN",
          matchStartedAt: { gte: windowStart, lte: windowEnd },
        },
      });

      const matchCount = group._count._all;
      const winRate = matchCount > 0 ? (wins / matchCount) * 100 : 0;

      return {
        mapName: group.mapName,
        matchCount,
        winRate,
      };
    }),
  );

  const mapsWithMinMatches = mapsWithStats.filter((map) => map.matchCount >= 3);
  const bestMap = mapsWithMinMatches.length > 0
    ? mapsWithMinMatches.reduce((best, current) =>
        current.winRate > best.winRate ? current : best
      ).mapName
    : null;
  const worstMap = mapsWithMinMatches.length > 0
    ? mapsWithMinMatches.reduce((worst, current) =>
        current.winRate < worst.winRate ? current : worst
      ).mapName
    : null;

  return {
    matchCount,
    wins,
    losses,
    kills: totalKills,
    deaths: totalDeaths,
    assists: totalAssists,
    averageKda,
    winRate,
    headshotRate,
    damagePerRound,
    combatScore,
    firstDeathRate,
    attackWinRate,
    defenseWinRate,
    utilityPerRound,
    mainAgent,
    bestMap,
    worstMap,
    rankProgressValue,
  };
}

async function calculatePlayerAgentAggregate(
  userId: string,
  window: AggregationWindow,
): Promise<Array<{ agentName: string; matchCount: number; winRate: number; averageKda: number; damagePerRound: number }>> {
  const { windowStart, windowEnd } = window;

  const agentGroups = await prisma.playerMatchStats.groupBy({
    by: ["agentName"],
    where: {
      userId,
      matchStartedAt: { gte: windowStart, lte: windowEnd },
    },
    _count: { _all: true },
    _avg: {
      kills: true,
      deaths: true,
      assists: true,
      damagePerRound: true,
    },
  });

  const result = await Promise.all(
    agentGroups.map(async (group) => {
      const wins = await prisma.playerMatchStats.count({
        where: {
          userId,
          agentName: group.agentName,
          result: "WIN",
          matchStartedAt: { gte: windowStart, lte: windowEnd },
        },
      });

      const matchCount = group._count._all;
      const totalKills = (group._avg.kills ?? 0) * matchCount;
      const totalDeaths = (group._avg.deaths ?? 0) * matchCount;
      const averageKda = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
      const winRate = (wins / matchCount) * 100;
      const damagePerRound = Number(group._avg.damagePerRound ?? 0);

      return {
        agentName: group.agentName,
        matchCount,
        winRate,
        averageKda,
        damagePerRound,
      };
    }),
  );

  return result;
}

async function calculatePlayerMapAggregate(
  userId: string,
  window: AggregationWindow,
): Promise<Array<{ mapName: string; matchCount: number; winRate: number; attackWinRate: number; defenseWinRate: number; averageKda: number }>> {
  const { windowStart, windowEnd } = window;

  const mapGroups = await prisma.playerMatchStats.groupBy({
    by: ["mapName"],
    where: {
      userId,
      matchStartedAt: { gte: windowStart, lte: windowEnd },
    },
    _count: { _all: true },
    _avg: {
      kills: true,
      deaths: true,
      assists: true,
    },
    _sum: {
      attackRoundsWon: true,
      attackRoundsPlayed: true,
      defenseRoundsWon: true,
      defenseRoundsPlayed: true,
    },
  });

  const result = await Promise.all(
    mapGroups.map(async (group) => {
      const wins = await prisma.playerMatchStats.count({
        where: {
          userId,
          mapName: group.mapName,
          result: "WIN",
          matchStartedAt: { gte: windowStart, lte: windowEnd },
        },
      });

      const matchCount = group._count._all;
      const totalKills = (group._avg.kills ?? 0) * matchCount;
      const totalDeaths = (group._avg.deaths ?? 0) * matchCount;
      const averageKda = totalDeaths > 0 ? totalKills / totalDeaths : totalKills;
      const winRate = (wins / matchCount) * 100;

      const totalAttackRoundsWon = group._sum.attackRoundsWon ?? 0;
      const totalAttackRoundsPlayed = group._sum.attackRoundsPlayed ?? 0;
      const totalDefenseRoundsWon = group._sum.defenseRoundsWon ?? 0;
      const totalDefenseRoundsPlayed = group._sum.defenseRoundsPlayed ?? 0;

      const attackWinRate = totalAttackRoundsPlayed > 0 ? (totalAttackRoundsWon / totalAttackRoundsPlayed) * 100 : 0;
      const defenseWinRate = totalDefenseRoundsPlayed > 0 ? (totalDefenseRoundsWon / totalDefenseRoundsPlayed) * 100 : 0;

      return {
        mapName: group.mapName,
        matchCount,
        winRate,
        attackWinRate,
        defenseWinRate,
        averageKda,
      };
    }),
  );

  return result;
}

export async function aggregatePlayerStats(userId: string, periods: AggregatePeriod[] = ["ALL_TIME"]): Promise<void> {
  const riotAccount = await prisma.riotAccount.findUnique({
    where: { userId },
  });

  const currentRank = riotAccount?.currentRank ?? null;
  const currentRankTier = riotAccount?.currentRankTier ?? null;

  for (const period of periods) {
    const window = getAggregationWindow(period);
    const stats = await calculatePlayerStatAggregate(userId, window);

    await prisma.playerStatAggregate.upsert({
      where: {
        userId_period_windowStart_windowEnd: {
          userId,
          period,
          windowStart: window.windowStart,
          windowEnd: window.windowEnd,
        },
      },
      create: {
        userId,
        period,
        windowStart: window.windowStart,
        windowEnd: window.windowEnd,
        rank: currentRank,
        rankTier: currentRankTier,
        matchCount: stats.matchCount,
        wins: stats.wins,
        losses: stats.losses,
        kills: stats.kills,
        deaths: stats.deaths,
        assists: stats.assists,
        averageKda: stats.averageKda,
        winRate: stats.winRate,
        headshotRate: stats.headshotRate,
        damagePerRound: stats.damagePerRound,
        combatScore: stats.combatScore,
        firstDeathRate: stats.firstDeathRate,
        attackWinRate: stats.attackWinRate,
        defenseWinRate: stats.defenseWinRate,
        utilityPerRound: stats.utilityPerRound,
        mainAgent: stats.mainAgent,
        bestMap: stats.bestMap,
        worstMap: stats.worstMap,
        rankProgressValue: stats.rankProgressValue,
      },
      update: {
        rank: currentRank,
        rankTier: currentRankTier,
        matchCount: stats.matchCount,
        wins: stats.wins,
        losses: stats.losses,
        kills: stats.kills,
        deaths: stats.deaths,
        assists: stats.assists,
        averageKda: stats.averageKda,
        winRate: stats.winRate,
        headshotRate: stats.headshotRate,
        damagePerRound: stats.damagePerRound,
        combatScore: stats.combatScore,
        firstDeathRate: stats.firstDeathRate,
        attackWinRate: stats.attackWinRate,
        defenseWinRate: stats.defenseWinRate,
        utilityPerRound: stats.utilityPerRound,
        mainAgent: stats.mainAgent,
        bestMap: stats.bestMap,
        worstMap: stats.worstMap,
        rankProgressValue: stats.rankProgressValue,
        computedAt: new Date(),
      },
    });
  }
}

export async function aggregatePlayerAgentStats(userId: string, periods: AggregatePeriod[] = ["ALL_TIME"]): Promise<void> {
  for (const period of periods) {
    const window = getAggregationWindow(period);
    const agentStats = await calculatePlayerAgentAggregate(userId, window);

    // Delete existing aggregates for this period
    await prisma.playerAgentAggregate.deleteMany({
      where: {
        userId,
        period,
        windowStart: window.windowStart,
        windowEnd: window.windowEnd,
      },
    });

    // Create new aggregates
    if (agentStats.length > 0) {
      await prisma.playerAgentAggregate.createMany({
        data: agentStats.map((stat) => ({
          userId,
          period,
          windowStart: window.windowStart,
          windowEnd: window.windowEnd,
          agentName: stat.agentName,
          matchCount: stat.matchCount,
          winRate: stat.winRate,
          averageKda: stat.averageKda,
          damagePerRound: stat.damagePerRound,
        })),
      });
    }
  }
}

export async function aggregatePlayerMapStats(userId: string, periods: AggregatePeriod[] = ["ALL_TIME"]): Promise<void> {
  for (const period of periods) {
    const window = getAggregationWindow(period);
    const mapStats = await calculatePlayerMapAggregate(userId, window);

    // Delete existing aggregates for this period
    await prisma.playerMapAggregate.deleteMany({
      where: {
        userId,
        period,
        windowStart: window.windowStart,
        windowEnd: window.windowEnd,
      },
    });

    // Create new aggregates
    if (mapStats.length > 0) {
      await prisma.playerMapAggregate.createMany({
        data: mapStats.map((stat) => ({
          userId,
          period,
          windowStart: window.windowStart,
          windowEnd: window.windowEnd,
          mapName: stat.mapName,
          matchCount: stat.matchCount,
          winRate: stat.winRate,
          attackWinRate: stat.attackWinRate,
          defenseWinRate: stat.defenseWinRate,
          averageKda: stat.averageKda,
        })),
      });
    }
  }
}

export async function aggregateAllPlayerStats(userId: string, periods: AggregatePeriod[] = ["ALL_TIME", "LAST_7_DAYS", "LAST_30_DAYS"]): Promise<void> {
  await Promise.all([
    aggregatePlayerStats(userId, periods),
    aggregatePlayerAgentStats(userId, periods),
    aggregatePlayerMapStats(userId, periods),
  ]);

  // Trigger AI analysis job for ALL_TIME period
  const allTimeAggregate = await prisma.playerStatAggregate.findFirst({
    where: {
      userId,
      period: "ALL_TIME",
    },
    orderBy: { computedAt: "desc" },
  });

  if (allTimeAggregate && allTimeAggregate.matchCount >= 5) {
    await prisma.syncJob.create({
      data: {
        userId,
        type: SyncJobType.AI_ANALYSIS,
        status: "QUEUED",
        idempotencyKey: `ai-analysis-${userId}-${allTimeAggregate.id}-${allTimeAggregate.computedAt.getTime()}`,
        payload: { userId, aggregateId: allTimeAggregate.id.toString() },
        runAt: new Date(),
      },
    });
  }
}
