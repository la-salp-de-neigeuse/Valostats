import { getUserBySlug } from "@/services/users/user-service";
import {
  getAggregateStatsByPeriod,
  getAgentAggregatesByPeriod,
  getMapAggregatesByPeriod,
} from "@/services/stats/aggregate-stats-service";
import { getEvolutionData, getRecentMatchesForChart } from "@/services/stats/evolution-stats-service";
import { getLatestAnalysis } from "@/services/ai/ai-analysis-service";
import { prisma } from "@/lib/prisma/client";
import { getOrSet } from "@/lib/cache/cache-service";
import { comparisonKey, TTL } from "@/lib/cache/keys";
import type { ComparedPlayer, ComparisonData, AiComparisonSummary } from "./types";

function computeAdvantages(a: ComparedPlayer, b: ComparedPlayer): { player1: string[]; player2: string[] } {
  const p1: string[] = [];
  const p2: string[] = [];

  const checks: Array<{ key: string; get: (p: ComparedPlayer) => number; higherBetter: boolean }> = [
    { key: "Winrate", get: (p) => p.winRate, higherBetter: true },
    { key: "K/D", get: (p) => p.kda, higherBetter: true },
    { key: "ADR", get: (p) => p.adr, higherBetter: true },
    { key: "ACS", get: (p) => p.acs, higherBetter: true },
    { key: "Headshot", get: (p) => p.headshotRate, higherBetter: true },
    { key: "Score IA", get: (p) => p.aiScore ?? 0, higherBetter: true },
    { key: "Matchs joués", get: (p) => p.matchCount, higherBetter: true },
    { key: "First Death", get: (p) => p.firstDeathRate, higherBetter: false },
    { key: "Attaque (Winrate)", get: (p) => p.attackWinRate, higherBetter: true },
    { key: "Défense (Winrate)", get: (p) => p.defenseWinRate, higherBetter: true },
    { key: "Utilitaire/Round", get: (p) => p.utilityPerRound, higherBetter: true },
  ];

  for (const c of checks) {
    const va = c.get(a);
    const vb = c.get(b);
    if (va === vb) continue;

    const diff = Math.abs(va - vb);
    const maxVal = Math.max(Math.abs(va), Math.abs(vb), 1);
    const relDiff = diff / maxVal;

    if (relDiff < 0.05) continue;

    const label = c.key;
    const winner = c.higherBetter ? (va > vb ? a : b) : (va < vb ? a : b);
    if (winner === a) {
      p1.push(label);
    } else {
      p2.push(label);
    }
  }

  return { player1: p1, player2: p2 };
}

function generateAiSummary(p1: ComparedPlayer, p2: ComparedPlayer, adv: { player1: string[]; player2: string[] }): AiComparisonSummary {
  const p1Score = (p1.aiScore ?? 50) + adv.player1.length * 3;
  const p2Score = (p2.aiScore ?? 50) + adv.player2.length * 3;
  
  let advantageTo: "PLAYER1" | "PLAYER2" | "TIE" = "TIE";
  if (p1Score > p2Score + 5) advantageTo = "PLAYER1";
  else if (p2Score > p1Score + 5) advantageTo = "PLAYER2";
  
  const globalScore = Math.max(Math.min((p1Score + p2Score) / 2, 100), 0);
  
  const p1Strengths = Array.from(new Set([...p1.aiInsights.strengths.slice(0, 3), ...adv.player1.slice(0, 2).map(a => `Avantage en ${a}`)])).slice(0, 5);
  const p2Strengths = Array.from(new Set([...p2.aiInsights.strengths.slice(0, 3), ...adv.player2.slice(0, 2).map(a => `Avantage en ${a}`)])).slice(0, 5);
  const p1Weaknesses = p1.aiInsights.weaknesses.slice(0, 4);
  const p2Weaknesses = p2.aiInsights.weaknesses.slice(0, 4);
  
  const diffKda = p1.kda - p2.kda;
  
  let areasForImprovement = "";
  if (advantageTo === "PLAYER1") {
    areasForImprovement = `${p2.displayName} a un retard global. Pour rivaliser, il doit se concentrer sur ${p2Weaknesses.length > 0 ? "l'amélioration de ses faiblesses clés" : "ses fondamentaux"}. L'écart principal se situe au niveau ${diffKda > 0.15 ? "du K/D, témoignant d'une perte de duels importante" : "de l'impact global et de la macro-game"}.`;
  } else if (advantageTo === "PLAYER2") {
    areasForImprovement = `${p1.displayName} est en difficulté dans ce face-à-face. Il devrait corriger ${p1Weaknesses.length > 0 ? "ses faiblesses prioritaires" : "ses lacunes"} pour rattraper ${p2.displayName}. L'écart principal se ressent sur ${diffKda < -0.15 ? "les duels directs et le K/D" : "l'impact stratégique et le winrate"}.`;
  } else {
    areasForImprovement = "Un duel extrêmement serré. La différence se fera sur des détails : la régularité, la communication en équipe et la capacité d'adaptation en cours de match.";
  }
  
  return {
    advantageTo,
    globalScore: Math.round(globalScore),
    player1Strengths: p1Strengths,
    player2Strengths: p2Strengths,
    player1Weaknesses: p1Weaknesses,
    player2Weaknesses: p2Weaknesses,
    areasForImprovement
  };
}

async function buildComparedPlayer(
  slug: string,
): Promise<ComparedPlayer | null> {
  const user = await getUserBySlug(slug);
  if (!user) return null;

  const [stats, agents, maps, analysis, recentMatches, riotAccount, evolution] = await Promise.all([
    getAggregateStatsByPeriod(user.id, "all"),
    getAgentAggregatesByPeriod(user.id, "all"),
    getMapAggregatesByPeriod(user.id, "all"),
    getLatestAnalysis(user.id),
    getRecentMatchesForChart(user.id, 10),
    prisma.riotAccount.findUnique({
      where: { userId: user.id },
      select: { currentRankTier: true, currentRank: true },
    }),
    getEvolutionData(user.id),
  ]);

  const displayName =
    user.name ?? (user.riotAccount ? `${user.riotAccount.gameName}#${user.riotAccount.tagLine}` : slug);

  const topAgents = agents.slice(0, 5).map((a) => ({
    name: a.agentDisplayName,
    matches: a.matchCount,
    winRate: a.winRate,
    kda: a.averageKda,
  }));

  const topMaps = maps.slice(0, 5).map((m) => ({
    name: m.mapName,
    matches: m.matchCount,
    winRate: m.winRate,
  }));

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (analysis?.insights) {
    analysis.insights.forEach((insight) => {
      if (insight.severity >= 3) {
        weaknesses.push(`${insight.category}: ${insight.problem}`);
      } else {
        strengths.push(`${insight.category}: ${insight.problem}`);
      }
    });
  }

  return {
    slug,
    displayName,
    rank: user.riotAccount?.currentRank ?? riotAccount?.currentRank ?? null,
    rankTier: user.riotAccount?.currentRankTier ?? riotAccount?.currentRankTier ?? null,
    rr: riotAccount?.currentRankTier ?? null,
    matchCount: stats.matchCount,
    wins: stats.wins,
    losses: stats.losses,
    winRate: stats.winRate,
    kda: stats.kdRatio,
    adr: stats.damagePerRound,
    acs: stats.combatScore,
    headshotRate: stats.headshotRate,
    aiScore: analysis?.score ?? null,
    progression: stats.rankProgressValue,
    firstDeathRate: stats.firstDeathRate,
    attackWinRate: stats.attackWinRate,
    defenseWinRate: stats.defenseWinRate,
    utilityPerRound: stats.utilityPerRound,
    topAgents,
    topMaps,
    recentResults: recentMatches.map((m) => m.result),
    evolution: evolution || [],
    aiInsights: {
      strengths,
      weaknesses,
      summary: analysis?.summary ?? null,
    },
  };
}

export async function getComparison(a: string, b: string): Promise<ComparisonData | null> {
  return getOrSet(
    comparisonKey(a, b),
    async () => {
      const [player1, player2] = await Promise.all([
        buildComparedPlayer(a),
        buildComparedPlayer(b),
      ]);

      if (!player1 || !player2) return null;

      const advantages = computeAdvantages(player1, player2);
      const aiSummary = generateAiSummary(player1, player2, advantages);

      return { player1, player2, advantages, aiSummary };
    },
    TTL.COMPARISON,
  );
}
