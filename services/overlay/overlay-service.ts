import { prisma } from "@/lib/prisma/client";
import { getLatestAnalysis } from "@/services/ai/ai-analysis-service";
import { formatAgentName } from "@/lib/valorant/agents";
import { getOverlaySettings } from "./overlay-settings-service";
import { getOrSet } from "@/lib/cache/cache-service";
import { overlayKey, TTL } from "@/lib/cache/keys";
import type { OverlayData, OverlayMatchEntry } from "./types";

function computeWinStreak(matches: OverlayMatchEntry[]): number {
  let streak = 0;
  for (const m of matches) {
    if (m.result === "WIN") streak++;
    else break;
  }
  return streak;
}

function formatSyncTime(date: Date | null | undefined): string | null {
  if (!date) return null;
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}j`;
}

export async function getOverlayData(slug: string): Promise<OverlayData | null> {
  return getOrSet(overlayKey(slug), async () => {
    const user = await prisma.user.findUnique({
    where: { publicSlug: slug },
    select: {
      id: true,
      name: true,
      visibility: true,
      riotAccount: {
        select: { gameName: true, tagLine: true, currentRank: true, currentRankTier: true, lastSyncAt: true },
      },
      settings: {
        select: { showRankPublicly: true },
      },
    },
  });

  if (!user) return null;
  if (user.visibility !== "PUBLIC") return null;

  const serviceUserId = user.id;
  const canShowRank = user.settings?.showRankPublicly ?? false;

  const [aggregate, analysis, overlayConfig, recentMatches, goals, latestInsight] = await Promise.all([
    prisma.playerStatAggregate.findFirst({
      where: { userId: serviceUserId, period: "ALL_TIME" },
      orderBy: { computedAt: "desc" },
    }),
    getLatestAnalysis(serviceUserId),
    getOverlaySettings(serviceUserId),
    prisma.playerMatchStats.findMany({
      where: { userId: serviceUserId },
      orderBy: { matchStartedAt: "desc" },
      take: 20,
      select: {
        result: true,
        mapName: true,
        agentName: true,
        kills: true,
        deaths: true,
        assists: true,
        matchStartedAt: true,
      },
    }),
    prisma.goal.findFirst({
      where: { userId: serviceUserId, status: "IN_PROGRESS" },
      orderBy: { createdAt: "desc" },
      select: { title: true, currentValue: true, targetValue: true },
    }),
    prisma.aiAnalysis.findFirst({
      where: { userId: serviceUserId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      select: {
        insights: {
          orderBy: { severity: "desc" },
          take: 1,
          select: { problem: true, solution: true },
        },
      },
    }),
  ]);

  const playerName =
    user.name ??
    (user.riotAccount ? `${user.riotAccount.gameName}#${user.riotAccount.tagLine}` : "Joueur");

  const lastMatches: OverlayMatchEntry[] = recentMatches.map((m) => ({
    result: m.result,
    mapName: m.mapName,
    agentName: m.agentName,
    kills: m.kills,
    deaths: m.deaths,
    assists: m.assists,
    matchStartedAt: m.matchStartedAt.toISOString(),
  }));

  const winStreak = computeWinStreak(lastMatches);
  const lastMatchEntry = lastMatches[0] ?? null;

  const [agentAggs, bestAgentAgg] = await Promise.all([
    prisma.playerAgentAggregate.findMany({
      where: { userId: serviceUserId, period: "ALL_TIME" },
      orderBy: { matchCount: "desc" },
      take: 1,
      select: { agentName: true },
    }),
    prisma.playerAgentAggregate.findFirst({
      where: { userId: serviceUserId, period: "ALL_TIME", matchCount: { gte: 5 } },
      orderBy: { winRate: "desc" },
      select: { agentName: true, winRate: true },
    }),
  ]);

  return {
    playerName,
    rank: canShowRank ? (user.riotAccount?.currentRank ?? aggregate?.rank ?? null) : null,
    rankTier: canShowRank ? (user.riotAccount?.currentRankTier ?? aggregate?.rankTier ?? null) : null,
    rankProgressValue: canShowRank ? Number(aggregate?.rankProgressValue ?? 0) : 0,
    winRate: canShowRank ? Number(aggregate?.winRate ?? 0) : 0,
    kda: canShowRank ? Number(aggregate?.averageKda ?? 0) : 0,
    aiScore: canShowRank ? (analysis ? analysis.score : null) : null,
    matchCount: aggregate?.matchCount ?? 0,
    wins: aggregate?.wins ?? 0,
    losses: aggregate?.losses ?? 0,
    lastMatches,
    lastMatch: lastMatchEntry,
    lastAgent: lastMatchEntry?.agentName ?? null,
    mainAgent: agentAggs[0] ? formatAgentName(agentAggs[0].agentName) : null,
    bestAgent: bestAgentAgg ? { name: formatAgentName(bestAgentAgg.agentName), winRate: Number(bestAgentAgg.winRate) } : null,
    winStreak,
    lastResult: lastMatchEntry?.result ?? null,
    goalOfDay: goals
      ? { title: goals.title, progress: Number(goals.currentValue), target: Number(goals.targetValue) }
      : null,
    lastAiInsight: latestInsight?.insights[0]
      ? { problem: latestInsight.insights[0].problem, solution: latestInsight.insights[0].solution }
      : null,
    syncTimeAgo: formatSyncTime(user.riotAccount?.lastSyncAt ?? null),
    settings: overlayConfig,
  };
  }, TTL.OVERLAY);
}
