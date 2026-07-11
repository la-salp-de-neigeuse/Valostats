import { randomUUID } from "crypto";

import type { SyncJob } from "@prisma/client";
import { z } from "zod";

import { handleStatAggregationJob } from "@/jobs/aggregation/run-stat-aggregation";
import { handleAiAnalysisJob } from "@/jobs/ai-analysis/run-ai-analysis";
import { handleRiotSyncJob } from "@/jobs/riot-sync/sync-matches";
import { prisma } from "@/lib/prisma/client";

type SyncJobType = SyncJob["type"];

const DEFAULT_BATCH_SIZE = 5;
const MAX_BATCH_SIZE = 20;
const CLAIM_SCAN_MULTIPLIER = 4;
const RETRY_BASE_DELAY_MS = 30_000;
const RETRY_MAX_DELAY_MS = 15 * 60_000;

const JOB_TIMEOUT_MS: Record<SyncJobType, number> = {
  RIOT_MATCH_SYNC: 5 * 60_000,
  STAT_AGGREGATION: 3 * 60_000,
  AI_ANALYSIS: 2 * 60_000,
  LEADERBOARD_REBUILD: 5 * 60_000,
  PUBLIC_PROFILE_REBUILD: 2 * 60_000,
};

const riotSyncPayloadSchema = z.object({
  userId: z.string().uuid(),
});

const statAggregationPayloadSchema = z.object({
  userId: z.string().uuid(),
});

const aiAnalysisPayloadSchema = z.object({
  userId: z.string().uuid(),
  aggregateId: z.string().regex(/^\d+$/, "aggregateId invalide"),
});

type SupportedJobType =
  | "RIOT_MATCH_SYNC"
  | "STAT_AGGREGATION"
  | "AI_ANALYSIS";

type JobHandlerDefinition = {
  parsePayload: (payload: unknown) => unknown;
  run: (payload: unknown) => Promise<unknown>;
  getWarning?: (result: unknown) => string | null;
};

const supportedJobHandlers: Record<SupportedJobType, JobHandlerDefinition> = {
  RIOT_MATCH_SYNC: {
    parsePayload: (payload) => riotSyncPayloadSchema.parse(payload),
    run: (payload) =>
      handleRiotSyncJob(payload as z.infer<typeof riotSyncPayloadSchema>),
    getWarning: (result) =>
      (result as { errors?: string[] }).errors?.[0] ?? null,
  },
  STAT_AGGREGATION: {
    parsePayload: (payload) => statAggregationPayloadSchema.parse(payload),
    run: (payload) =>
      handleStatAggregationJob(payload as z.infer<typeof statAggregationPayloadSchema>),
  },
  AI_ANALYSIS: {
    parsePayload: (payload) => aiAnalysisPayloadSchema.parse(payload),
    run: (payload) =>
      handleAiAnalysisJob(payload as z.infer<typeof aiAnalysisPayloadSchema>),
  },
};

export interface RunQueuedJobsOptions {
  limit?: number;
  workerId?: string;
}

export interface RunJobOptions {
  workerId?: string;
}

export interface JobExecutionSummary {
  jobId: string;
  type?: SyncJobType;
  status: "completed" | "retried" | "failed" | "not_claimed";
  attempts: number;
  maxAttempts: number;
  runAt?: string;
  warning?: string | null;
  error?: string;
  result?: unknown;
}

export interface BatchExecutionSummary {
  workerId: string;
  scanned: number;
  processed: number;
  completed: number;
  retried: number;
  failed: number;
  skipped: number;
  jobs: JobExecutionSummary[];
}

function stringifyBigInts(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyBigInts(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, stringifyBigInts(nestedValue)]),
    );
  }

  return value;
}

function logJobEvent(
  level: "info" | "warn" | "error",
  event: string,
  data: Record<string, unknown>,
): void {
  const serializedData = stringifyBigInts(data) as Record<string, unknown>;
  const serialized = JSON.stringify({
    scope: "jobs",
    event,
    timestamp: new Date().toISOString(),
    ...serializedData,
  });

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.info(serialized);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Payload de job invalide";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erreur inconnue";
}

function getRetryDelayMs(attempts: number): number {
  return Math.min(RETRY_BASE_DELAY_MS * 2 ** Math.max(0, attempts - 1), RETRY_MAX_DELAY_MS);
}

function getJobTimeoutMs(type: SyncJobType): number {
  return JOB_TIMEOUT_MS[type];
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function getJobId(jobId: bigint): string {
  return jobId.toString();
}

export function createJobRunnerId(prefix = "job-runner"): string {
  return `${prefix}-${randomUUID()}`;
}

function isSupportedJobType(type: SyncJobType): type is SupportedJobType {
  return type in supportedJobHandlers;
}

function isJobTimedOut(job: Pick<SyncJob, "type" | "lockedAt">, now: Date): boolean {
  if (!job.lockedAt) {
    return false;
  }

  return now.getTime() - job.lockedAt.getTime() >= getJobTimeoutMs(job.type);
}

function normalizeBatchSize(limit?: number): number {
  if (!limit || Number.isNaN(limit) || limit <= 0) {
    return DEFAULT_BATCH_SIZE;
  }

  return Math.min(limit, MAX_BATCH_SIZE);
}

async function listClaimableJobs(limit: number, now: Date): Promise<SyncJob[]> {
  const scanLimit = Math.max(limit * CLAIM_SCAN_MULTIPLIER, limit);

  const [queuedJobs, runningJobs] = await Promise.all([
    prisma.syncJob.findMany({
      where: {
        status: "QUEUED",
        runAt: { lte: now },
      },
      orderBy: [{ runAt: "asc" }, { createdAt: "asc" }],
      take: scanLimit,
    }),
    prisma.syncJob.findMany({
      where: {
        status: "RUNNING",
        lockedAt: { not: null },
      },
      orderBy: [{ lockedAt: "asc" }, { createdAt: "asc" }],
      take: scanLimit,
    }),
  ]);

  const staleRunningJobs = runningJobs.filter((job) => isJobTimedOut(job, now));
  const uniqueJobs = new Map<string, SyncJob>();

  for (const job of [...queuedJobs, ...staleRunningJobs]) {
    uniqueJobs.set(getJobId(job.id), job);
  }

  return [...uniqueJobs.values()].sort((left, right) => {
    const leftDate = left.status === "QUEUED" ? left.runAt.getTime() : left.lockedAt?.getTime() ?? 0;
    const rightDate =
      right.status === "QUEUED" ? right.runAt.getTime() : right.lockedAt?.getTime() ?? 0;

    return leftDate - rightDate;
  });
}

async function claimJob(job: SyncJob, workerId: string, now: Date): Promise<SyncJob | null> {
  if (job.status === "QUEUED") {
    return prisma.$transaction(async (tx) => {
      const claimed = await tx.syncJob.updateMany({
        where: {
          id: job.id,
          status: "QUEUED",
          runAt: { lte: now },
        },
        data: {
          status: "RUNNING",
          lockedAt: now,
          lockOwner: workerId,
          completedAt: null,
          lastError: null,
        },
      });

      if (claimed.count === 0) {
        return null;
      }

      return tx.syncJob.update({
        where: { id: job.id },
        data: {
          attempts: { increment: 1 },
        },
      });
    });
  }

  if (job.status === "RUNNING" && isJobTimedOut(job, now)) {
    const staleBefore = new Date(now.getTime() - getJobTimeoutMs(job.type));

    return prisma.$transaction(async (tx) => {
      const claimed = await tx.syncJob.updateMany({
        where: {
          id: job.id,
          status: "RUNNING",
          lockedAt: { lte: staleBefore },
        },
        data: {
          status: "RUNNING",
          lockedAt: now,
          lockOwner: workerId,
          completedAt: null,
          lastError: `Reprise apres timeout par ${workerId}`,
        },
      });

      if (claimed.count === 0) {
        return null;
      }

      return tx.syncJob.update({
        where: { id: job.id },
        data: {
          attempts: { increment: 1 },
        },
      });
    });
  }

  return null;
}

async function completeJob(job: SyncJob, warning: string | null): Promise<void> {
  await prisma.syncJob.update({
    where: { id: job.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      lockedAt: null,
      lockOwner: null,
      lastError: warning,
    },
  });
}

async function failJob(job: SyncJob, errorMessage: string): Promise<JobExecutionSummary> {
  const now = new Date();
  const shouldRetry = job.attempts < job.maxAttempts;

  if (shouldRetry) {
    const retryAt = new Date(now.getTime() + getRetryDelayMs(job.attempts));

    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "QUEUED",
        runAt: retryAt,
        lockedAt: null,
        lockOwner: null,
        completedAt: null,
        lastError: errorMessage,
      },
    });

    logJobEvent("warn", "job.retried", {
      jobId: job.id,
      type: job.type,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      retryAt,
      error: errorMessage,
    });

    return {
      jobId: getJobId(job.id),
      type: job.type,
      status: "retried",
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      error: errorMessage,
      runAt: retryAt.toISOString(),
    };
  }

  await prisma.syncJob.update({
    where: { id: job.id },
    data: {
      status: "FAILED",
      lockedAt: null,
      lockOwner: null,
      completedAt: now,
      lastError: errorMessage,
    },
  });

  logJobEvent("error", "job.failed", {
    jobId: job.id,
    type: job.type,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    error: errorMessage,
  });

  return {
    jobId: getJobId(job.id),
    type: job.type,
    status: "failed",
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    error: errorMessage,
  };
}

async function executeClaimedJob(job: SyncJob): Promise<JobExecutionSummary> {
  if (!isSupportedJobType(job.type)) {
    return failJob(job, `Type de job non implemente: ${job.type}`);
  }

  const definition = supportedJobHandlers[job.type];
  const startedAt = Date.now();

  try {
    const payload = definition.parsePayload(job.payload);
    const result = await withTimeout(
      definition.run(payload),
      getJobTimeoutMs(job.type),
      `Timeout depasse pour le job ${job.type}`,
    );
    const warning = definition.getWarning?.(result) ?? null;

    await completeJob(job, warning);

    logJobEvent(warning ? "warn" : "info", "job.completed", {
      jobId: job.id,
      type: job.type,
      attempts: job.attempts,
      durationMs: Date.now() - startedAt,
      warning,
    });

    return {
      jobId: getJobId(job.id),
      type: job.type,
      status: "completed",
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      warning,
      result: stringifyBigInts(result),
    };
  } catch (error) {
    return failJob(job, getErrorMessage(error));
  }
}

export async function runJobById(
  jobId: bigint,
  options: RunJobOptions = {},
): Promise<JobExecutionSummary> {
  const workerId = options.workerId ?? createJobRunnerId("job-on-demand");
  const now = new Date();
  const job = await prisma.syncJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return {
      jobId: getJobId(jobId),
      type: "RIOT_MATCH_SYNC",
      status: "failed",
      attempts: 0,
      maxAttempts: 0,
      error: "Job introuvable",
    };
  }

  const claimedJob = await claimJob(job, workerId, now);
  if (!claimedJob) {
    return {
      jobId: getJobId(job.id),
      type: job.type,
      status: "not_claimed",
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      error: `Job non reclamable dans l'etat ${job.status}`,
    };
  }

  logJobEvent("info", "job.claimed", {
    jobId: claimedJob.id,
    type: claimedJob.type,
    workerId,
    attempts: claimedJob.attempts,
    maxAttempts: claimedJob.maxAttempts,
  });

  return executeClaimedJob(claimedJob);
}

export async function runQueuedJobsBatch(
  options: RunQueuedJobsOptions = {},
): Promise<BatchExecutionSummary> {
  const workerId = options.workerId ?? createJobRunnerId("job-batch");
  const limit = normalizeBatchSize(options.limit);
  const now = new Date();
  const candidates = await listClaimableJobs(limit, now);
  const jobs: JobExecutionSummary[] = [];

  for (const candidate of candidates) {
    if (jobs.length >= limit) {
      break;
    }

    const claimedJob = await claimJob(candidate, workerId, new Date());
    if (!claimedJob) {
      continue;
    }

    logJobEvent("info", "job.claimed", {
      jobId: claimedJob.id,
      type: claimedJob.type,
      workerId,
      attempts: claimedJob.attempts,
      maxAttempts: claimedJob.maxAttempts,
    });

    jobs.push(await executeClaimedJob(claimedJob));
  }

  return {
    workerId,
    scanned: candidates.length,
    processed: jobs.length,
    completed: jobs.filter((job) => job.status === "completed").length,
    retried: jobs.filter((job) => job.status === "retried").length,
    failed: jobs.filter((job) => job.status === "failed").length,
    skipped: Math.max(candidates.length - jobs.length, 0),
    jobs,
  };
}
