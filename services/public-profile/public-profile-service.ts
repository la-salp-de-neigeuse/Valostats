import { prisma } from "@/lib/prisma/client";
import { getAggregateStatsByPeriod, getAgentAggregatesByPeriod, getMapAggregatesByPeriod, type StatsPeriod } from "@/services/stats/aggregate-stats-service";
import { getRecentMatchesForChart } from "@/services/stats/evolution-stats-service";
import type { PublicProfile, PublicProfileError } from "./types";

export async function getPublicProfile(slug: string, period: StatsPeriod = "all"): Promise<PublicProfile | PublicProfileError> {
  // Get user by slug with deletedAt
  const user = await prisma.user.findUnique({
    where: { publicSlug: slug },
    select: {
      id: true,
      name: true,
      publicSlug: true,
      deletedAt: true,
      visibility: true,
      role: true,
      settings: {
        select: {
          showMatchHistory: true,
          showAiScore: true,
        },
      },
      riotAccount: {
        select: {
          gameName: true,
          tagLine: true,
          currentRank: true,
          currentRankTier: true,
        },
      },
    },
  });
  
  if (!user) {
    return { code: "NOT_FOUND", message: "Profil introuvable." };
  }

  if (user.deletedAt) {
    return { code: "DELETED", message: "Ce compte a été supprimé." };
  }

  // Get full riot account info
  const riotAccount = await prisma.riotAccount.findUnique({
    where: { userId: user.id },
    select: {
      gameName: true,
      tagLine: true,
      currentRank: true,
      currentRankTier: true,
      platform: true,
      regionGroup: true,
    },
  });

  // Get stats in parallel
  const [stats, agents, maps, recentMatches, aiAnalysis] = await Promise.all([
    getAggregateStatsByPeriod(user.id, period),
    getAgentAggregatesByPeriod(user.id, period),
    getMapAggregatesByPeriod(user.id, period),
    getRecentMatchesForChart(user.id, 10),
    user.settings?.showAiScore ? getLatestAiAnalysis(user.id) : Promise.resolve(null),
  ]);

  return {
    user: {
      id: user.id,
      name: user.name,
      publicSlug: user.publicSlug,
      visibility: user.visibility,
      role: user.role,
      riotAccount: riotAccount ? {
        gameName: riotAccount.gameName,
        tagLine: riotAccount.tagLine,
        currentRank: riotAccount.currentRank,
        currentRankTier: riotAccount.currentRankTier,
        platform: riotAccount.platform,
        regionGroup: riotAccount.regionGroup,
      } : null,
    },
    stats,
    agents,
    maps,
    recentMatches,
    aiAnalysis,
    period,
  };
}

async function getLatestAiAnalysis(userId: string) {
  const analysis = await prisma.aiAnalysis.findFirst({
    where: { userId, status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    include: { insights: true },
  });

  if (!analysis) return null;

  return {
    score: analysis.score !== null ? Number(analysis.score) : null,
    summary: analysis.summary,
    insights: analysis.insights.map((insight) => ({
      category: insight.category,
      severity: insight.severity,
      problem: insight.problem,
      solution: insight.solution,
    })),
  };
}
