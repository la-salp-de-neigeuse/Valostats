import { RiotRegionGroup, SyncJobType } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { competitiveTierToRank } from "@/lib/valorant/competitive-tiers";
import { RiotApiError, sleep } from "@/services/riot-api/api-client";
import { getMatchDetails, getMatchIdsByPuuid } from "@/services/riot-api/match-api";
import { transformMatch } from "@/services/riot-api/match-transformer";
import { recalculateGoals } from "@/services/goals/goals-service";
import { createNotification } from "@/services/notifications/notifications-service";
import { cacheDelete } from "@/lib/cache/cache-service";

export interface MatchSyncResult {
  matchIdsFound: number;
  matchesInserted: number;
  playerStatsInserted: number;
  skippedDuplicates: number;
  errors: string[];
}

const BATCH_SIZE = 20;
const MATCH_DETAIL_DELAY_MS = 250;
const SYNC_LOCK_MINUTES = 5;
const SYNC_COOLDOWN_MINUTES = 5;

function parseSyncCursor(cursor: string | null): number | null {
  if (!cursor) return null;
  const parsed = parseInt(cursor, 10);
  return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
}

async function collectMatchIds(
  puuid: string,
  regionGroup: RiotRegionGroup,
  syncCursor: string | null,
): Promise<{ ids: string[]; nextCursor: string | null }> {
  const allIds = new Set<string>();

  const recentIds = await getMatchIdsByPuuid(puuid, regionGroup, {
    size: BATCH_SIZE,
    startIndex: 0,
  });
  recentIds.forEach((id) => allIds.add(id));

  let nextCursor: string | null = syncCursor;
  const backfillIndex = parseSyncCursor(syncCursor);

  if (backfillIndex !== null && backfillIndex > 0) {
    const backfillIds = await getMatchIdsByPuuid(puuid, regionGroup, {
      size: BATCH_SIZE,
      startIndex: backfillIndex,
    });
    backfillIds.forEach((id) => allIds.add(id));

    nextCursor =
      backfillIds.length < BATCH_SIZE ? null : String(backfillIndex + BATCH_SIZE);
  } else if (!syncCursor && recentIds.length === BATCH_SIZE) {
    nextCursor = String(BATCH_SIZE);
  }

  return { ids: [...allIds], nextCursor };
}

export async function syncMatchesForUser(userId: string): Promise<MatchSyncResult> {
  const result: MatchSyncResult = {
    matchIdsFound: 0,
    matchesInserted: 0,
    playerStatsInserted: 0,
    skippedDuplicates: 0,
    errors: [],
  };

  const riotAccount = await prisma.riotAccount.findUnique({ where: { userId } });

  if (!riotAccount) {
    throw new Error("Aucun compte Riot lié à cet utilisateur");
  }

  if (!riotAccount.isVerified) {
    throw new Error("Le compte Riot doit être vérifié avant la synchronisation des matchs");
  }

  if (riotAccount.syncLockUntil && riotAccount.syncLockUntil > new Date()) {
    throw new Error("Une synchronisation est déjà en cours pour ce compte");
  }

  const lockUntil = new Date(Date.now() + SYNC_LOCK_MINUTES * 60 * 1000);
  await prisma.riotAccount.update({
    where: { userId },
    data: { syncLockUntil: lockUntil },
  });

  let nextCursor: string | null = riotAccount.syncCursor;

  let firstPlayerCardId: string | null = null;

  try {
    const { ids: matchIds, nextCursor: computedCursor } = await collectMatchIds(
      riotAccount.riotPuuid,
      riotAccount.regionGroup,
      riotAccount.syncCursor,
    );
    nextCursor = computedCursor;
    result.matchIdsFound = matchIds.length;

    const existingMatches = await prisma.valorantMatch.findMany({
      where: { riotMatchId: { in: matchIds } },
      select: { riotMatchId: true },
    });
    const existingIds = new Set(existingMatches.map((m) => m.riotMatchId));
    const newMatchIds = matchIds.filter((id) => !existingIds.has(id));
    result.skippedDuplicates = matchIds.length - newMatchIds.length;

    for (let i = 0; i < newMatchIds.length; i++) {
      const matchId = newMatchIds[i];

      if (i > 0) {
        await sleep(MATCH_DETAIL_DELAY_MS);
      }

      try {
        const matchDto = await getMatchDetails(matchId, riotAccount.regionGroup);
        const { match: matchData, playerStatsByPuuid } = transformMatch(
          matchDto,
          riotAccount.platform,
          riotAccount.regionGroup,
        );

        const createdMatch = await prisma.valorantMatch.upsert({
          where: { riotMatchId: matchData.riotMatchId },
          create: matchData,
          update: {},
        });

        result.matchesInserted++;

        const playerStats = playerStatsByPuuid.get(riotAccount.riotPuuid);

        if (playerStats) {
          if (!firstPlayerCardId && playerStats.playerCardId) {
            firstPlayerCardId = playerStats.playerCardId;
          }
          try {
            await prisma.playerMatchStats.upsert({
              where: {
                userId_matchId: {
                  userId,
                  matchId: createdMatch.id,
                },
              },
              create: {
                userId,
                matchId: createdMatch.id,
                ...playerStats,
              },
              update: {},
            });
            result.playerStatsInserted++;
          } catch {
          }
        }
      } catch (err) {
        if (err instanceof RiotApiError && err.status === 429) {
          result.errors.push(`Rate limit atteint à matchId=${matchId}, sync partielle`);
          break;
        }
        if (err instanceof RiotApiError) {
          result.errors.push(`Erreur API pour matchId=${matchId}: ${err.message}`);
        } else if (err instanceof Error) {
          result.errors.push(`Erreur pour matchId=${matchId}: ${err.message}`);
        }
      }
    }

    const now = new Date();
    const nextSyncAt = new Date(now.getTime() + SYNC_COOLDOWN_MINUTES * 60 * 1000);

    const latestStats = await prisma.playerMatchStats.findFirst({
      where: { userId, rankTierAtMatch: { not: null } },
      orderBy: { matchStartedAt: "desc" },
      select: { rankTierAtMatch: true },
    });
    const latestRankTier = latestStats?.rankTierAtMatch;
    let currentRank: string | undefined;
    let currentRankTier: number | undefined;
    if (latestRankTier != null) {
      currentRank = competitiveTierToRank(latestRankTier);
      currentRankTier = latestRankTier;
    } else if (!riotAccount.currentRankTier) {
      currentRank = "Non classé";
      currentRankTier = 0;
    }

    await prisma.riotAccount.update({
      where: { userId },
      data: {
        lastSyncAt: now,
        nextSyncAt,
        syncCursor: nextCursor,
        syncLockUntil: null,
        lastSyncError: result.errors.length > 0 ? result.errors[0] : null,
        ...(firstPlayerCardId ? { currentPlayerCardId: firstPlayerCardId } : {}),
        ...(currentRank !== undefined ? { currentRank } : {}),
        ...(currentRankTier !== undefined ? { currentRankTier } : {}),
      },
    });

    if (result.playerStatsInserted > 0) {
      await prisma.syncJob.create({
        data: {
          userId,
          type: SyncJobType.STAT_AGGREGATION,
          status: "QUEUED",
          idempotencyKey: `stat-aggregation-${userId}-${now.getTime()}`,
          payload: { userId },
          runAt: new Date(),
        },
      });

      try {
        await recalculateGoals(userId);
      } catch {
      }

      try {
        await createNotification({
          userId,
          type: "SYNC_COMPLETED",
          title: `${result.matchesInserted} nouveau(x) match(s) synchronisé(s)`,
          body: `${result.matchIdsFound} match(s) trouvé(s), ${result.skippedDuplicates} ignoré(s)`,
          link: "/matches",
          metadata: {
            matchesInserted: result.matchesInserted,
            matchesFound: result.matchIdsFound,
            skippedDuplicates: result.skippedDuplicates,
            errors: result.errors.length,
          },
        });
      } catch {
      }
    }

    const cacheKeys = [
      `cache:dashboard:${userId}:v2`,
      `cache:dashboard:${userId}:heatmap`,
      `cache:dashboard:${userId}:timeline`,
      `cache:dashboard:${userId}:activity`,
      `cache:dashboard:${userId}:goals`,
      `cache:dashboard:${userId}:rank-evolution`,
      `cache:dashboard:${userId}:vs-average`,
      `cache:stats:${userId}:*`,
      `cache:evolution:${userId}`,
      `cache:period-compare:${userId}`,
      `cache:recent-matches:${userId}:*`,
      `cache:performance:${userId}:*`,
      `cache:match-history:${userId}:*`,
    ];
    for (const key of cacheKeys) {
      if (key.endsWith(":*")) {
        try {
          const { getRedis } = await import("@/lib/redis/client");
          const client = getRedis();
          if (client) {
            const stream = client.scanStream({ match: key, count: 100 });
            for await (const keys of stream) {
              if (keys.length > 0) {
                await client.del(...keys);
              }
            }
          }
        } catch {}
      } else {
        await cacheDelete(key).catch(() => {});
      }
    }

    return result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erreur inconnue";
    await prisma.riotAccount.update({
      where: { userId },
      data: {
        syncLockUntil: null,
        lastSyncError: errorMessage,
      },
    });
    throw err;
  }
}
