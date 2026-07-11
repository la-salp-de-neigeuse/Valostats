import { aggregateAllPlayerStats } from "@/services/aggregation/stats-aggregation-service";

export interface StatAggregationJobPayload {
  userId: string;
}

/**
 * Handler du job STAT_AGGREGATION.
 *
 * L'orchestrateur gère les transitions Prisma (RUNNING / COMPLETED / FAILED).
 * Ce handler ne contient que la logique métier.
 */
export async function handleStatAggregationJob(
  payload: StatAggregationJobPayload
): Promise<void> {
  await aggregateAllPlayerStats(payload.userId, ["ALL_TIME", "LAST_7_DAYS", "LAST_30_DAYS"]);
}
