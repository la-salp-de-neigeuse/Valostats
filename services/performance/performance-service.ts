import { prisma } from "@/lib/prisma/client";
import { formatAgentName } from "@/lib/valorant/agents";
import { getOrSet } from "@/lib/cache/cache-service";
import { performanceKey, TTL } from "@/lib/cache/keys";
import {
  getAggregateStatsByPeriod,
  getAgentAggregatesByPeriod,
  getMapAggregatesByPeriod,
  type StatsPeriod,
  type AggregateStats,
} from "@/services/stats/aggregate-stats-service";
import { getLatestAnalysis, getLatestCoachingReport } from "@/services/ai/ai-analysis-service";
import type { PerformanceData, PerformanceMetrics, AgentPerformanceItem, MapPerformanceItem, RadarMetric } from "./types";

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function computeMetrics(aggregate: AggregateStats | null, userId: string): Promise<PerformanceMetrics> {
  return (async () => {
    const duelStats = aggregate
      ? await prisma.playerMatchStats.aggregate({
          where: { userId },
          _sum: {
            openingDuelsTaken: true,
            openingDuelsWon: true,
            firstBloods: true,
            firstDeaths: true,
            plants: true,
            defuses: true,
            roundsPlayed: true,
            deaths: true,
          },
        })
      : null;

    const totals = {
      openingDuelsTaken: duelStats?._sum.openingDuelsTaken ?? 0,
      openingDuelsWon: duelStats?._sum.openingDuelsWon ?? 0,
      firstBloods: duelStats?._sum.firstBloods ?? 0,
      firstDeaths: duelStats?._sum.firstDeaths ?? 0,
      plants: duelStats?._sum.plants ?? 0,
      defuses: duelStats?._sum.defuses ?? 0,
      roundsPlayed: duelStats?._sum.roundsPlayed ?? 0,
      deaths: duelStats?._sum.deaths ?? 0,
    };

    const matchCount = aggregate?.matchCount ?? 0;
    const wins = aggregate?.wins ?? 0;
    const losses = aggregate?.losses ?? 0;
    const attackWinRate = aggregate ? Number(aggregate.attackWinRate) : 0;
    const defenseWinRate = aggregate ? Number(aggregate.defenseWinRate) : 0;
    const survivalRate = totals.roundsPlayed > 0 ? round(1 - totals.deaths / totals.roundsPlayed) : 0;

    return {
      winRate: aggregate ? Number(aggregate.winRate) : 0,
      kda: aggregate ? Number(aggregate.kdRatio) : 0,
      headshotRate: aggregate ? Number(aggregate.headshotRate) : 0,
      damagePerRound: aggregate ? Number(aggregate.damagePerRound) : 0,
      combatScore: aggregate ? Number(aggregate.combatScore) : 0,
      attackWinRate: Number(attackWinRate),
      defenseWinRate: Number(defenseWinRate),
      openingDuelSuccess: totals.openingDuelsTaken > 0 ? round((totals.openingDuelsWon / totals.openingDuelsTaken) * 100, 1) : 0,
      firstBloodsPerMatch: matchCount > 0 ? round(totals.firstBloods / matchCount, 2) : 0,
      firstDeathsPerMatch: matchCount > 0 ? round(totals.firstDeaths / matchCount, 2) : 0,
      utilityPerRound: aggregate ? Number(aggregate.utilityPerRound) : 0,
      plantsPerMatch: matchCount > 0 ? round(totals.plants / matchCount, 2) : 0,
      defusesPerMatch: matchCount > 0 ? round(totals.defuses / matchCount, 2) : 0,
      survivalRate,
      roundsPlayed: totals.roundsPlayed,
      matchCount,
      wins,
      losses,
    };
  })();
}

function buildRadar(metrics: PerformanceMetrics, aiScore: number | null): RadarMetric[] {
  return [
    { metric: "Winrate", value: metrics.winRate, fullMark: 100 },
    { metric: "K/D", value: Math.min(metrics.kda * 50, 100), fullMark: 100 },
    { metric: "Attaque", value: metrics.attackWinRate, fullMark: 100 },
    { metric: "Défense", value: metrics.defenseWinRate, fullMark: 100 },
    { metric: "Headshot", value: Math.min(metrics.headshotRate * 2, 100), fullMark: 100 },
    { metric: "Score IA", value: aiScore ?? 0, fullMark: 100 },
  ];
}

function buildVsAverage(aggregate: AggregateStats | null): PerformanceData["vsAverage"] {
  if (!aggregate || aggregate.matchCount < 5) return [];
  const avg = aggregate; // PlayerStatAggregate holds averages directly
  return [
    { label: "K/D", playerValue: Number(avg.kdRatio), averageValue: Number(avg.kdRatio) * 0.85, unit: "", higherIsBetter: true },
    { label: "Winrate", playerValue: Number(avg.winRate), averageValue: 50, unit: "%", higherIsBetter: true },
    { label: "Headshot", playerValue: Number(avg.headshotRate), averageValue: Number(avg.headshotRate) * 0.9, unit: "%", higherIsBetter: true },
    { label: "ADR", playerValue: Number(avg.damagePerRound), averageValue: Number(avg.damagePerRound) * 0.85, unit: "", higherIsBetter: true },
    { label: "ACS", playerValue: Number(avg.combatScore), averageValue: Number(avg.combatScore) * 0.85, unit: "", higherIsBetter: true },
  ];
}

export async function getPerformanceData(
  userId: string,
  period: StatsPeriod = "all",
): Promise<PerformanceData> {
  return getOrSet(performanceKey(userId, period), async () => {
    const [aggregate, agents, maps, analysis, coachingReport] = await Promise.all([
    getAggregateStatsByPeriod(userId, period),
    getAgentAggregatesByPeriod(userId, period),
    getMapAggregatesByPeriod(userId, period),
    getLatestAnalysis(userId),
    getLatestCoachingReport(userId),
  ]);

  const metrics = await computeMetrics(aggregate, userId);
  const hasData = metrics.matchCount > 0;

  const agentItems: AgentPerformanceItem[] = agents.map((a) => ({
    agentName: a.agentName,
    agentDisplayName: formatAgentName(a.agentName),
    matchCount: a.matchCount,
    winRate: Number(a.winRate),
    averageKda: Number(a.averageKda),
    damagePerRound: Number(a.damagePerRound),
  }));

  const mapItems: MapPerformanceItem[] = maps.map((m) => ({
    mapName: m.mapName,
    matchCount: m.matchCount,
    winRate: Number(m.winRate),
    attackWinRate: Number(m.attackWinRate),
    defenseWinRate: Number(m.defenseWinRate),
    averageKda: Number(m.averageKda),
  }));

  const radar = hasData ? buildRadar(metrics, analysis?.score ?? null) : [];
  const vsAverage = buildVsAverage(aggregate);

  const aiScore = analysis?.score ?? null;
  const strengths = (coachingReport?.strengths ?? []).map((s) => s.problem);
  const weaknesses = (coachingReport?.weaknesses ?? []).map((w) => w.problem);

    return {
      current: metrics,
      agents: agentItems,
      maps: mapItems,
      radar,
      aiInsights: {
        score: aiScore,
        summary: analysis?.summary ?? null,
        strengths,
        weaknesses,
      },
      vsAverage,
      hasData,
    };
  }, TTL.PERFORMANCE);
}
