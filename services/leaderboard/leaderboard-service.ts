import type { AggregatePeriod, LeaderboardSortKey, RiotRegionGroup } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import { getOrSet } from "@/lib/cache/cache-service";
import { leaderboardKey, TTL } from "@/lib/cache/keys";

export type LeaderboardPeriod = "7d" | "30d" | "all";

export interface LeaderboardFilters {
  period: LeaderboardPeriod;
  sortBy: LeaderboardSortKey;
  region?: RiotRegionGroup;
  rankTierMin?: number;
  rankTierMax?: number;
  page?: number;
  limit?: number;
}

export interface LeaderboardPlayerEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  publicSlug: string;
  gameName: string | null;
  tagLine: string | null;
  rankName: string | null;
  rankTier: number | null;
  region: string | null;
  matchCount: number;
  winRate: number;
  kda: number;
  aiScore: number | null;
  progression: number;
}

export interface LeaderboardResult {
  entries: LeaderboardPlayerEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapPeriod(period: LeaderboardPeriod): AggregatePeriod {
  switch (period) {
    case "7d":
      return "LAST_7_DAYS";
    case "30d":
      return "LAST_30_DAYS";
    case "all":
      return "ALL_TIME";
  }
}

function getSortPrisma(sortBy: LeaderboardSortKey) {
  switch (sortBy) {
    case "KDA":
      return { averageKda: "desc" as const };
    case "WIN_RATE":
      return { winRate: "desc" as const };
    case "AI_SCORE":
      return { aiScore: "desc" as const };
    case "PROGRESSION":
      return { rankProgressValue: "desc" as const };
    case "MATCH_COUNT":
      return { matchCount: "desc" as const };
  }
}

export async function getLeaderboard(
  filters: LeaderboardFilters
): Promise<LeaderboardResult> {
  return getOrSet(leaderboardKey(filters as unknown as Record<string, unknown>), async () => {
    const aggregatePeriod = mapPeriod(filters.period);
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 50));
  const skip = (page - 1) * limit;

  // Find the latest aggregation window for this period
  const latestWindow = await prisma.playerStatAggregate.findFirst({
    where: { period: aggregatePeriod },
    orderBy: { windowEnd: "desc" },
    select: { windowStart: true, windowEnd: true },
  });

  if (!latestWindow) {
    return { entries: [], total: 0, page, limit, totalPages: 0 };
  }

  // Build where clause
  const where: Record<string, unknown> = {
    period: aggregatePeriod,
    windowStart: latestWindow.windowStart,
    windowEnd: latestWindow.windowEnd,
  };

  // Region filter — join through user -> riotAccount
  if (filters.region) {
    where.user = {
      riotAccount: {
        regionGroup: filters.region,
      },
    };
  }

  // Rank tier filter — use aggregate's rankTier (synced from RiotAccount)
  if (filters.rankTierMin !== undefined || filters.rankTierMax !== undefined) {
    const rankFilter: Record<string, number> = {};
    if (filters.rankTierMin !== undefined) rankFilter.gte = filters.rankTierMin;
    if (filters.rankTierMax !== undefined) rankFilter.lte = filters.rankTierMax;
    where.rankTier = rankFilter;
  }

  // AI_SCORE sort puts nulls last
  const orderBy = getSortPrisma(filters.sortBy);

  // Run count + data in parallel
  const [total, rows] = await Promise.all([
    prisma.playerStatAggregate.count({ where }),
    prisma.playerStatAggregate.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            publicSlug: true,
            riotAccount: {
              select: {
                gameName: true,
                tagLine: true,
                currentRank: true,
                currentRankTier: true,
                regionGroup: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const entries: LeaderboardPlayerEntry[] = rows.map((row, index) => ({
    rank: skip + index + 1,
    userId: row.user.id,
    displayName: row.user.name,
    publicSlug: row.user.publicSlug,
    gameName: row.user.riotAccount?.gameName ?? null,
    tagLine: row.user.riotAccount?.tagLine ?? null,
    rankName: row.user.riotAccount?.currentRank ?? null,
    rankTier: row.user.riotAccount?.currentRankTier ?? null,
    region: row.user.riotAccount?.regionGroup ?? null,
    matchCount: row.matchCount,
    winRate: Number(row.winRate),
    kda: Number(row.averageKda),
    aiScore: row.aiScore !== null ? Number(row.aiScore) : null,
    progression: Number(row.rankProgressValue),
  }));

  return {
    entries,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
  }, TTL.LEADERBOARD);
}
