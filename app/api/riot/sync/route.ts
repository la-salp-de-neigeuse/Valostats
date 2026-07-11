import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { prisma } from "@/lib/prisma/client";
import { createJobRunnerId, runJobById } from "@/jobs/orchestrator";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new HttpError(401, "Non authentifié");
    }

    const rateCheck = await checkRateLimit(user.id, "riotSync");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Trop de synchronisations. Réessayez dans une minute." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateCheck.resetAt / 1000)),
          },
        },
      );
    }

    const riotAccount = await prisma.riotAccount.findUnique({
      where: { userId: user.id },
      select: { isVerified: true, syncLockUntil: true, nextSyncAt: true },
    });

    if (!riotAccount) {
      return NextResponse.json(
        { error: "Aucun compte Riot lié. Liez votre compte avant de synchroniser." },
        { status: 400 }
      );
    }

    if (!riotAccount.isVerified) {
      return NextResponse.json(
        { error: "Votre compte Riot doit être vérifié avant la synchronisation." },
        { status: 400 }
      );
    }

    if (riotAccount.syncLockUntil && riotAccount.syncLockUntil > new Date()) {
      return NextResponse.json(
        { error: "Une synchronisation est déjà en cours. Réessayez dans quelques minutes." },
        { status: 409 }
      );
    }

    if (riotAccount.nextSyncAt && riotAccount.nextSyncAt > new Date()) {
      return NextResponse.json(
        { error: "Synchronisation trop récente. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const idempotencyKey = `riot-sync:${user.id}:${Math.floor(Date.now() / 60000)}`;
    const syncJob = await prisma.syncJob.upsert({
      where: { idempotencyKey },
      create: {
        userId: user.id,
        type: "RIOT_MATCH_SYNC",
        status: "QUEUED",
        idempotencyKey,
        payload: { userId: user.id },
        maxAttempts: 3,
      },
      update: {},
    });

    if (syncJob.status !== "QUEUED") {
      return NextResponse.json(
        { error: "Synchronisation déjà en cours ou récemment effectuée." },
        { status: 409 }
      );
    }

    const execution = await runJobById(syncJob.id, {
      workerId: createJobRunnerId("user-riot-sync"),
    });

    if (execution.status === "completed") {
      return NextResponse.json({
        message: "Synchronisation terminee",
        jobId: execution.jobId,
        result: execution.result,
        warning: execution.warning,
      });
    }

    if (execution.status === "retried") {
      return NextResponse.json(
        {
          error: execution.error,
          jobId: execution.jobId,
          retryAt: execution.runAt,
        },
        { status: 503 }
      );
    }

    if (execution.status === "not_claimed") {
      return NextResponse.json(
        {
          message: "Synchronisation en file d'attente",
          jobId: execution.jobId,
          detail: execution.error,
        },
        { status: 202 }
      );
    }

    return NextResponse.json(
      {
        error: execution.error ?? "Echec de la synchronisation",
        jobId: execution.jobId,
      },
      { status: 500 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
