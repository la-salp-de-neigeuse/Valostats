import { prisma } from "@/lib/prisma/client";
import { formatAgentName } from "@/lib/valorant/agents";
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
    const raw = aggregate
      ? await prisma.playerMatchStats.findMany({
          where: { userId },
          select: {
            openingDuelsTaken: true,
            openingDuelsWon: true,
            firstBloods: true,
            firstDeaths: true,
            plants: true,
            defuses: true,
            roundsPlayed: true,
            kills: true,
            deaths: true,
            result: true,
          },
        })
      : [];

    const totals = raw.reduce(
      (acc, m) => {
        acc.openingDuelsTaken += m.openingDuelsTaken;
        acc.openingDuelsWon += m.openingDuelsWon;
        acc.firstBloods += m.firstBloods;
        acc.firstDeaths += m.firstDeaths;
        acc.plants += m.plants;
        acc.defuses += m.defuses;
        acc.roundsPlayed += m.roundsPlayed;
        acc.kills += m.kills;
        acc.deaths += m.deaths;
        if (m.result === "WIN") acc.wins++;
        else if (m.result === "LOSS") acc.losses++;
        return acc;
      },
      {
        openingDuelsTaken: 0,
        openingDuelsWon: 0,
        firstBloods: 0,
        firstDeaths: 0,
        plants: 0,
        defuses: 0,
        roundsPlayed: 0,
        kills: 0,
        deaths: 0,
        wins: 0,
        losses: 0,
      },
    );

    const matchCount = raw.length;
    const attackWinRate = aggregate ? Number(aggregate.attackWinRate) : (totals.wins > 0 && totals.losses > 0 ? totals.wins / (totals.wins + totals.losses) * 100 : 0);
    const defenseWinRate = aggregate ? Number(aggregate.defenseWinRate) : 0;
    const survivalRate = totals.roundsPlayed > 0 ? round(1 - totals.deaths / totals.roundsPlayed) : 0;

    return {
      winRate: aggregate ? Number(aggregate.winRate) : (matchCount > 0 ? round(totals.wins / matchCount * 100, 1) : 0),
      kda: aggregate ? Number(aggregate.kdRatio) : (totals.deaths > 0 ? round(totals.kills / totals.deaths, 2) : totals.kills),
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
      wins: totals.wins,
      losses: totals.losses,
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
}
