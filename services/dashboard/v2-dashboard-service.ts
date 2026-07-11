import { prisma } from "@/lib/prisma/client";
import { getLatestAnalysis } from "@/services/ai/ai-analysis-service";
import type {
  V2DashboardData,
  HeatmapCell,
  TimelineEntry,
  ActivityEntry,
  GoalsSummary,
  RankPoint,
  VsAverage,
} from "./types";

export async function getV2DashboardData(userId: string): Promise<V2DashboardData> {
  const [heatmap, timeline, activity, goals, rankEvolution, insights] = await Promise.all([
    getHeatmapData(userId),
    getTimelineData(userId),
    getActivityData(userId),
    getGoalsSummary(userId),
    getRankEvolution(userId),
    getLatestAnalysis(userId),
  ]);

  const vsAverage = await getVsAverage(userId);

  return {
    heatmap,
    timeline,
    activity,
    goals,
    rankEvolution,
    insights: insights
      ? { score: insights.score, summary: insights.summary, count: insights.insights.length }
      : null,
    vsAverage,
  };
}

async function getHeatmapData(userId: string): Promise<HeatmapCell[]> {
  const [totalStats, winStats] = await Promise.all([
    prisma.playerMatchStats.groupBy({
      by: ["agentName", "mapName"],
      where: { userId },
      _count: true,
    }),
    prisma.playerMatchStats.groupBy({
      by: ["agentName", "mapName"],
      where: { userId, result: "WIN" },
      _count: true,
    }),
  ]);

  const winMap = new Map<string, number>();
  for (const w of winStats) {
    winMap.set(`${w.agentName}|${w.mapName}`, w._count);
  }

  return totalStats
    .filter((t) => t._count > 0)
    .map((t) => {
      const matchCount = t._count;
      const wins = winMap.get(`${t.agentName}|${t.mapName}`) ?? 0;
      return {
        agentName: t.agentName,
        mapName: t.mapName,
        matchCount,
        winRate: Math.round((wins / matchCount) * 100),
      };
    });
}

async function getTimelineData(userId: string): Promise<TimelineEntry[]> {
  const matches = await prisma.playerMatchStats.findMany({
    where: { userId },
    orderBy: { matchStartedAt: "desc" },
    take: 30,
    select: {
      id: true,
      result: true,
      agentName: true,
      mapName: true,
      kills: true,
      deaths: true,
      assists: true,
      score: true,
      matchStartedAt: true,
    },
  });

  return matches.map((m) => ({
    id: String(m.id),
    result: m.result,
    agentName: m.agentName,
    mapName: m.mapName,
    kills: m.kills,
    deaths: m.deaths,
    assists: m.assists,
    score: m.score,
    playedAt: m.matchStartedAt,
  }));
}

async function getActivityData(userId: string): Promise<ActivityEntry[]> {
  const [recentNotifications, recentSyncs] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, type: true, title: true, body: true, createdAt: true },
    }),
    prisma.syncJob.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: { id: true, type: true, completedAt: true },
    }),
  ]);

  const entries: ActivityEntry[] = [];

  for (const n of recentNotifications) {
    const activityType = mapNotificationType(n.type);
    entries.push({
      id: `notif-${n.id}`,
      type: activityType,
      title: n.title,
      description: n.body ?? "",
      timestamp: n.createdAt,
    });
  }

  for (const s of recentSyncs) {
    entries.push({
      id: `sync-${s.id}`,
      type: "sync",
      title: "Synchronisation terminée",
      description: s.type.replace(/_/g, " ").toLowerCase(),
      timestamp: s.completedAt ?? new Date(),
    });
  }

  entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return entries.slice(0, 15);
}

async function getGoalsSummary(userId: string): Promise<GoalsSummary> {
  const [activeCount, completedCount, totalCount] = await Promise.all([
    prisma.goal.count({ where: { userId, status: "IN_PROGRESS" } }),
    prisma.goal.count({ where: { userId, status: "COMPLETED" } }),
    prisma.goal.count({ where: { userId } }),
  ]);

  return {
    activeCount,
    completedCount,
    completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
    nextMilestone: completedCount < 5 ? "Complétez 5 objectifs" : completedCount < 25 ? "Atteignez 25 objectifs" : "Objectif ultime",
  };
}

async function getRankEvolution(userId: string): Promise<RankPoint[]> {
  const matches = await prisma.playerMatchStats.findMany({
    where: {
      userId,
      rankAtMatch: { not: null },
    },
    orderBy: { matchStartedAt: "asc" },
    take: 100,
    select: { rankAtMatch: true, rankTierAtMatch: true, matchStartedAt: true },
  });

  const seen = new Set<string>();
  const evolution: RankPoint[] = [];

  for (const m of matches) {
    const key = `${m.rankAtMatch}-${m.rankTierAtMatch}`;
    if (!seen.has(key)) {
      seen.add(key);
      evolution.push({
        rank: m.rankAtMatch ?? "",
        tier: m.rankTierAtMatch ?? 0,
        timestamp: m.matchStartedAt,
      });
    }
  }

  return evolution;
}

async function getVsAverage(userId: string): Promise<VsAverage[]> {
  const aggregate = await prisma.playerStatAggregate.findFirst({
    where: { userId, period: "ALL_TIME" },
    orderBy: { computedAt: "desc" },
    select: {
      matchCount: true,
      wins: true,
      kills: true,
      deaths: true,
      assists: true,
      winRate: true,
      averageKda: true,
      headshotRate: true,
      damagePerRound: true,
      combatScore: true,
    },
  });

  if (!aggregate || aggregate.matchCount < 5) return [];

  const globalAgg = await prisma.playerStatAggregate.aggregate({
    where: { period: "ALL_TIME" },
    _avg: {
      winRate: true,
      averageKda: true,
      headshotRate: true,
      damagePerRound: true,
      combatScore: true,
    },
  });

  const avg = globalAgg._avg;
  const totalDeaths = aggregate.deaths;

  return [
    {
      label: "K/D",
      playerValue: totalDeaths > 0 ? aggregate.kills / totalDeaths : aggregate.kills,
      averageValue: Number(avg.averageKda ?? 0),
      unit: "",
      higherIsBetter: true,
    },
    {
      label: "Winrate",
      playerValue: Number(aggregate.winRate),
      averageValue: Number(avg.winRate ?? 50),
      unit: "%",
      higherIsBetter: true,
    },
    {
      label: "Headshot",
      playerValue: Number(aggregate.headshotRate),
      averageValue: Number(avg.headshotRate ?? 0),
      unit: "%",
      higherIsBetter: true,
    },
    {
      label: "ADR",
      playerValue: Number(aggregate.damagePerRound),
      averageValue: Number(avg.damagePerRound ?? 0),
      unit: "",
      higherIsBetter: true,
    },
    {
      label: "ACS",
      playerValue: Number(aggregate.combatScore),
      averageValue: Number(avg.combatScore ?? 0),
      unit: "",
      higherIsBetter: true,
    },
  ];
}

function mapNotificationType(type: string): ActivityEntry["type"] {
  switch (type) {
    case "GOAL_COMPLETED": return "goal";
    case "BADGE_UNLOCKED": return "badge";
    case "RANK_CHANGE": return "rank";
    case "AI_INSIGHT":
    case "SCORE_IMPROVEMENT": return "analysis";
    default: return "sync";
  }
}
