import { NextResponse } from "next/server";
import { z } from "zod";

import { createJobRunnerId, runQueuedJobsBatch } from "@/jobs/orchestrator";
import { MAX_BODY_SIZE } from "@/constants/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z
  .object({
    limit: z.number().int().positive().max(20).optional(),
  })
  .optional();

function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const allowedSecrets = [process.env.INTERNAL_JOB_SECRET, process.env.CRON_SECRET].filter(
    (value): value is string => Boolean(value),
  );

  if (allowedSecrets.length === 0) {
    return false;
  }

  return allowedSecrets.some((secret) => authHeader === `Bearer ${secret}`);
}

async function executeBatch(limit?: number) {
  return runQueuedJobsBatch({
    limit,
    workerId: createJobRunnerId("api-cron"),
  });
}

async function readOptionalJson(request: Request): Promise<unknown> {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return undefined;
    }
    const text = await request.text();
    if (text.length > MAX_BODY_SIZE) return undefined;
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Route batch pour dépiler les jobs prêts à être exécutés.
 *
 * Compatible avec :
 * - cron externe (Authorization: Bearer INTERNAL_JOB_SECRET)
 * - Vercel Cron (Authorization: Bearer CRON_SECRET)
 * - worker séparé qui appelle l'endpoint périodiquement
 */
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  try {
    const rawBody = await readOptionalJson(request);
    const body = payloadSchema.parse(rawBody);

    const summary = await executeBatch(body?.limit);

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Payload invalide" }, { status: 400 });
    }

    console.error("Erreur execution batch jobs:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");

  try {
    const limit = limitParam ? z.coerce.number().int().positive().max(20).parse(limitParam) : undefined;
    const summary = await executeBatch(limit);

    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Parametre invalide" }, { status: 400 });
    }

    console.error("Erreur execution batch jobs:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
