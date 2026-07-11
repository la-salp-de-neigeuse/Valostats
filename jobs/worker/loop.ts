import { createJobRunnerId, runQueuedJobsBatch, type BatchExecutionSummary } from "@/jobs/orchestrator";

const DEFAULT_INTERVAL_MS = 15_000;

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export interface JobWorkerLoopOptions {
  batchSize?: number;
  intervalMs?: number;
  stopWhenIdle?: boolean;
  workerId?: string;
  signal?: AbortSignal;
}

/**
 * Boucle de polling réutilisable par un worker Node séparé.
 *
 * Exemple d'utilisation :
 * `await runJobWorkerLoop({ batchSize: 5, intervalMs: 15000 })`
 */
export async function runJobWorkerLoop(
  options: JobWorkerLoopOptions = {},
): Promise<BatchExecutionSummary | null> {
  const workerId = options.workerId ?? createJobRunnerId("standalone-worker");
  const batchSize = options.batchSize;
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  let lastSummary: BatchExecutionSummary | null = null;

  while (!options.signal?.aborted) {
    const summary = await runQueuedJobsBatch({
      limit: batchSize,
      workerId,
    });

    lastSummary = summary;

    if (options.stopWhenIdle && summary.processed === 0) {
      break;
    }

    await sleep(intervalMs);
  }

  return lastSummary;
}
