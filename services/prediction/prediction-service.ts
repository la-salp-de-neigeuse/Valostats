import { prisma } from "@/lib/prisma/client";
import { getLatestAnalysis } from "@/services/ai/ai-analysis-service";
import {
  getAggregateStatsByPeriod,
  getAgentAggregatesByPeriod,
  getMapAggregatesByPeriod,
} from "@/services/stats/aggregate-stats-service";
import { LEADERBOARD_RANKS } from "@/constants/periods";
import type {
  PredictionResult,
  RankBlock,
  ProgressionPoint,
  InfluencingFactor,
  PredictionWeights,
} from "./types";

const BLOCK_SIZE = 10;
const PROJECTION_MATCHES = 100;
const AVG_MATCH_DURATION_HOURS = 0.66; // 40 mins

export const DEFAULT_WEIGHTS: PredictionWeights = {
  recentWinrate: 0.3,
  overallKda: 0.2,
  overallAdr: 0.15,
  aiScore: 0.1,
  consistency: 0.1,
  mapPoolStrength: 0.075,
  agentPoolStrength: 0.075,
};

function tierToLabel(tier: number): string {
  for (const rank of LEADERBOARD_RANKS) {
    if (tier >= rank.tierMin && tier <= rank.tierMax) {
      const position = tier - rank.tierMin + 1;
      const positions = rank.tierMax - rank.tierMin + 1;
      return positions > 1 ? `${rank.label} ${position}` : rank.label;
    }
  }
  return "Inconnu";
}

interface RegResult {
  slope: number;
  intercept: number;
}

function linearRegression(x: number[], y: number[]): RegResult {
  const n = Math.min(x.length, y.length);
  if (n < 2) return { slope: 0, intercept: y[0] ?? 0 };

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function computeConfidence(
  matchCount: number,
  rankBlocks: RankBlock[],
  slope: number,
  residuals: number[],
  consistency: string,
): number {
  let score = 50; // base

  // Volume
  if (matchCount >= 50) score += 20;
  else if (matchCount >= 30) score += 10;
  else if (matchCount < 15) score -= 20;

  // Régularité
  if (residuals.length > 0) {
    const mse = residuals.reduce((a, b) => a + b * b, 0) / residuals.length;
    const rmse = Math.sqrt(mse);
    if (rmse < 0.3) score += 15;
    else if (rmse > 1.0) score -= 15;
  }

  if (consistency === "stable") score += 10;
  else if (consistency === "volatile") score -= 10;

  // Stabilité du niveau
  const absSlope = Math.abs(slope);
  if (absSlope < 0.05) score += 5;

  return Math.min(95, Math.max(10, Math.round(score)));
}

export async function getPrediction(
  userId: string,
  weights: PredictionWeights = DEFAULT_WEIGHTS,
): Promise<PredictionResult | null> {
  const [riotAccount, matches, analysis, aggregateStats, agents, maps] = await Promise.all([
    prisma.riotAccount.findUnique({
      where: { userId },
      select: { currentRank: true, currentRankTier: true },
    }),
    prisma.playerMatchStats.findMany({
      where: { userId, rankTierAtMatch: { not: null } },
      orderBy: { matchStartedAt: "asc" },
      select: {
        result: true,
        kills: true,
        deaths: true,
        assists: true,
        rankTierAtMatch: true,
        matchStartedAt: true,
        headshotRate: true,
        damagePerRound: true,
        combatScore: true,
      },
    }),
    getLatestAnalysis(userId),
    getAggregateStatsByPeriod(userId, "all"),
    getAgentAggregatesByPeriod(userId, "all"),
    getMapAggregatesByPeriod(userId, "all"),
  ]);

  if (matches.length < 2) {
    return null;
  }

  // --- 1. Blocs d'évolution ---
  const blockCount = Math.ceil(matches.length / BLOCK_SIZE);
  const rankBlocks: RankBlock[] = [];

  for (let i = 0; i < blockCount; i++) {
    const start = i * BLOCK_SIZE;
    const end = Math.min(start + BLOCK_SIZE, matches.length);
    const slice = matches.slice(start, end);

    const ranksInBlock = slice.filter((m) => m.rankTierAtMatch !== null).map((m) => Number(m.rankTierAtMatch));
    const averageRankTier = ranksInBlock.length > 0 ? ranksInBlock.reduce((a, b) => a + b, 0) / ranksInBlock.length : 0;
    const wins = slice.filter((m) => m.result === "WIN").length;
    const totalKills = slice.reduce((a, m) => a + m.kills, 0);
    const totalDeaths = slice.reduce((a, m) => a + m.deaths, 0);
    
    rankBlocks.push({
      label: `${start + 1}-${end}`,
      matchStart: start + 1,
      matchEnd: end,
      matchCount: slice.length,
      averageRankTier,
      wins,
      winRate: (wins / slice.length) * 100,
      kda: totalDeaths > 0 ? totalKills / totalDeaths : totalKills,
      adr: slice.length > 0 ? slice.reduce((a, m) => a + Number(m.damagePerRound || 0), 0) / slice.length : 0,
      headshotRate: slice.length > 0 ? slice.reduce((a, m) => a + Number(m.headshotRate || 0), 0) / slice.length : 0,
    });
  }

  // --- 2. Tendances ---
  const getTrend = (count: number) => {
    if (matches.length < count) return 50; // fallback
    const recent = matches.slice(-count);
    return (recent.filter((m) => m.result === "WIN").length / recent.length) * 100;
  };
  const trends = {
    last5: getTrend(5),
    last10: getTrend(10),
    last20: getTrend(20),
  };

  // --- 3. Séries (Streaks) ---
  let winStreak = 0;
  let lossStreak = 0;
  for (let i = matches.length - 1; i >= 0; i--) {
    if (matches[i].result === "WIN") {
      if (lossStreak > 0) break;
      winStreak++;
    } else if (matches[i].result === "LOSS") {
      if (winStreak > 0) break;
      lossStreak++;
    }
  }
  const streaks = { winStreak, lossStreak };

  // --- 4. Régression linéaire & Projection ---
  const validBlocks = rankBlocks.filter((b) => b.averageRankTier > 0);
  const blockIndices = validBlocks.map((_, i) => i);
  const blockRanks = validBlocks.map((b) => b.averageRankTier);

  const { slope, intercept } = blockIndices.length >= 2
    ? linearRegression(blockIndices, blockRanks)
    : { slope: 0, intercept: validBlocks[0]?.averageRankTier ?? 0 };

  const currentTier = riotAccount?.currentRankTier ?? Math.round(blockRanks[blockRanks.length - 1] ?? intercept);
  const nextTier = currentTier < 24 ? currentTier + 1 : 24;

  const matchesNeeded = slope > 0.005
    ? Math.ceil((nextTier - currentTier) / slope * BLOCK_SIZE)
    : Infinity;
    
  const estimatedTimeHours = matchesNeeded < Infinity ? Math.round(matchesNeeded * AVG_MATCH_DURATION_HOURS) : Infinity;
  const estimatedRR = currentTier * 100 + 50 + (slope * BLOCK_SIZE * 20); // Estimation brute du RR basé sur la pente

  // --- 5. Probabilité & Score Global (Pondéré) ---
  const profileConsistency = analysis ? "stable" as const : "volatile" as const;
  const residuals = validBlocks.map((b, i) => b.averageRankTier - (slope * i + intercept));
  const confidence = computeConfidence(matches.length, rankBlocks, slope, residuals, profileConsistency);

  const kdaScore = Math.min((aggregateStats.kdRatio / 1.5) * 100, 100);
  const adrScore = Math.min((aggregateStats.damagePerRound / 180) * 100, 100);
  const mapScore = maps.length > 0 ? (maps.filter(m => m.winRate >= 50).length / maps.length) * 100 : 50;
  const agentScore = agents.length > 0 ? (agents.filter(a => a.winRate >= 50).length / agents.length) * 100 : 50;
  
  const globalProgressionScore = Math.round(
    (trends.last20 * weights.recentWinrate) +
    (kdaScore * weights.overallKda) +
    (adrScore * weights.overallAdr) +
    ((analysis?.score ?? 50) * weights.aiScore) +
    (confidence * weights.consistency) +
    (mapScore * weights.mapPoolStrength) +
    (agentScore * weights.agentPoolStrength)
  );

  const winProbability = Math.min(Math.max(globalProgressionScore + (streaks.winStreak * 2) - (streaks.lossStreak * 2), 10), 90);
  const rankUpProbability = slope > 0 ? Math.min(winProbability + (slope * 50), 99) : Math.max(winProbability - 30, 1);

  // --- 6. Facteurs Influents ---
  const influencingFactors: InfluencingFactor[] = [];
  
  if (aggregateStats.kdRatio > 1.2) influencingFactors.push({ name: "K/D Ratio", impact: "positive", value: aggregateStats.kdRatio, description: "Avantage mécanique net" });
  else if (aggregateStats.kdRatio < 0.9) influencingFactors.push({ name: "K/D Ratio", impact: "negative", value: aggregateStats.kdRatio, description: "Difficulté en duels" });

  if (trends.last10 >= 60) influencingFactors.push({ name: "Tendance Winrate", impact: "positive", value: trends.last10, description: "Excellente dynamique récente" });
  else if (trends.last10 <= 40) influencingFactors.push({ name: "Tendance Winrate", impact: "negative", value: trends.last10, description: "Série compliquée" });

  if (analysis?.score && analysis.score > 75) influencingFactors.push({ name: "Score IA", impact: "positive", value: analysis.score, description: "Fondamentaux très solides" });

  if (streaks.winStreak >= 3) influencingFactors.push({ name: "Win Streak", impact: "positive", value: streaks.winStreak, description: "Momentum très favorable" });
  if (streaks.lossStreak >= 3) influencingFactors.push({ name: "Loss Streak", impact: "negative", value: streaks.lossStreak, description: "Mental potentiellement impacté" });

  if (aggregateStats.headshotRate > 25) influencingFactors.push({ name: "Headshot", impact: "positive", value: aggregateStats.headshotRate, description: "Aim supérieur à la moyenne" });

  // --- 7. Courbe de progression (Réelle vs Projetée) ---
  const ProgressionPointCount = Math.min(matches.length, 100);
  const curve: ProgressionPoint[] = [];

  for (let i = 0; i < ProgressionPointCount; i++) {
    const match = matches[i];
    const blockIdx = Math.floor(i / BLOCK_SIZE);
    const projected = slope * Math.min(blockIdx, validBlocks.length - 1) + intercept;
    curve.push({
      matchIndex: i + 1,
      actualRankTier: match?.rankTierAtMatch ?? null,
      projectedRankTier: Math.round(projected * 10) / 10,
    });
  }

  const projectTo = Math.min(matches.length + PROJECTION_MATCHES, matches.length * 3);
  for (let i = ProgressionPointCount; i <= projectTo; i += 5) {
    const blockIdx = Math.floor(i / BLOCK_SIZE);
    const projected = slope * Math.max(0, blockIdx) + intercept;
    curve.push({
      matchIndex: i,
      actualRankTier: null,
      projectedRankTier: Math.round(projected * 10) / 10,
    });
  }

  // --- 8. AI Coach Conseils & Summary ---
  let summary = "";
  const advice: string[] = [];

  if (globalProgressionScore >= 70) {
    summary = `Vos statistiques exceptionnelles suggèrent un passage très rapide vers ${tierToLabel(nextTier)}. Vous dominez statistiquement votre rang actuel.`;
    advice.push("Continuez à jouer vos agents forts, votre K/D et votre impact justifient une progression rapide.");
  } else if (globalProgressionScore >= 50) {
    summary = `Vous êtes sur la bonne voie pour atteindre ${tierToLabel(nextTier)}. Maintenez votre régularité pour franchir le palier.`;
    advice.push("Votre niveau est stable. Améliorer vos performances sur vos maps les plus faibles pourrait accélérer votre rank up.");
  } else {
    summary = `Votre progression stagne. Vos statistiques actuelles indiquent qu'il sera difficile d'atteindre ${tierToLabel(nextTier)} sans ajustement majeur.`;
    advice.push("Faites une pause si vous êtes en losing streak. Concentrez-vous sur vos fondamentaux : visée, positionnement et utilitaire.");
  }

  if (analysis?.insights) {
    analysis.insights.slice(0, 3).forEach(i => advice.push(`${i.category}: ${i.problem}`));
  }

  return {
    currentRankTier: currentTier,
    currentRankLabel: tierToLabel(currentTier),
    nextRankTier: nextTier,
    nextRankLabel: tierToLabel(nextTier),
    winProbability: Math.round(winProbability),
    probability: Math.round(rankUpProbability),
    estimatedMatches: matchesNeeded,
    estimatedTimeHours,
    estimatedRR: Math.round(estimatedRR),
    confidence,
    globalProgressionScore,
    progressionCurve: curve,
    rankBlocks,
    slope,
    intercept,
    summary,
    advice,
    influencingFactors,
    streaks,
    trends,
    aiScore: analysis?.score ?? null,
    consistency: {
      winrate: trends.last20,
      kda: aggregateStats.kdRatio,
      adr: aggregateStats.damagePerRound,
      overall: profileConsistency,
    },
    topAgents: agents.slice(0, 3).map(a => ({ name: a.agentDisplayName, matchCount: a.matchCount, winRate: a.winRate })),
    topMaps: maps.slice(0, 3).map(m => ({ name: m.mapName, matchCount: m.matchCount, winRate: m.winRate })),
  };
}
