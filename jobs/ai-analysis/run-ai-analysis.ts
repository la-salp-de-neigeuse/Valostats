import { runAiAnalysis } from "@/services/ai/ai-analysis-service";
import type { AnalysisResult } from "@/services/ai/types";

export interface AiAnalysisJobPayload {
  userId: string;
  aggregateId: string;
}

/**
 * Handler du job AI_ANALYSIS.
 *
 * L'orchestrateur gère les transitions Prisma (RUNNING / COMPLETED / FAILED).
 * Ce handler ne contient que la logique métier.
 */
export async function handleAiAnalysisJob(
  payload: AiAnalysisJobPayload
): Promise<AnalysisResult> {
  return runAiAnalysis(payload.userId, BigInt(payload.aggregateId));
}
