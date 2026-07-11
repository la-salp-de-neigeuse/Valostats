import { syncMatchesForUser } from "@/services/riot-api/match-sync-service";

import type { MatchSyncResult } from "@/services/riot-api/match-sync-service";
export interface RiotSyncJobPayload {
  userId: string;
}

/**
 * Handler du job RIOT_MATCH_SYNC.
 *
 * L'orchestrateur gère les transitions Prisma (RUNNING / COMPLETED / FAILED).
 * Ce handler ne contient que la logique métier.
 */
export async function handleRiotSyncJob(
  payload: RiotSyncJobPayload
): Promise<MatchSyncResult> {
  return syncMatchesForUser(payload.userId);
}
