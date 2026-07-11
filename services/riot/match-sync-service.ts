import { RiotRegionGroup, SyncJobType } from "@prisma/client";
import { prisma } from "@/lib/prisma/client";
import { RiotApiError, sleep } from "@/services/riot/api-client";
import { getMatchDetails, getMatchIdsByPuuid } from "@/services/riot/match-api";
import { transformMatch } from "@/services/riot/match-transformer";
import { recalculateGoals } from "@/services/goals/goals-service";
import { createNotification } from "@/services/notifications/notifications-service";

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

/**
 * Collecte les IDs de matchs à traiter :
 * - Toujours les 20 plus récents (sync incrémentale)
 * - + un lot historique si syncCursor est défini (backfill paginé)
 */
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

/**
 * Synchronise les matchs récents d'un utilisateur.
 *
 * Respecte :
 * - syncLockUntil : évite les syncs concurrentes
 * - syncCursor : reprend le backfill historique paginé
 * - lastSyncAt / nextSyncAt : horodatage et cooldown entre syncs
 *
 * Utilise les contraintes uniques Prisma pour éviter les doublons :
 * - ValorantMatch.riotMatchId (@unique)
 * - PlayerMatchStats @@unique([userId, matchId])
 */
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
            // Doublon ignoré silencieusement (contrainte unique)
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

    await prisma.riotAccount.update({
      where: { userId },
      data: {
        lastSyncAt: now,
        nextSyncAt,
        syncCursor: nextCursor,
        syncLockUntil: null,
        lastSyncError: result.errors.length > 0 ? result.errors[0] : null,
      },
    });

    // Trigger stat aggregation job if new matches were inserted
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

      // Recalculer les objectifs après chaque synchronisation
      try {
        await recalculateGoals(userId);
      } catch {
        // Échec silencieux : le recalcule des objectifs n'est pas bloquant
      }

      // Notification de synchronisation terminée
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
        // Échec silencieux
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
