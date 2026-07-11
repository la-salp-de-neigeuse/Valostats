import { NextResponse } from "next/server";
import { z } from "zod";
import { createJobRunnerId, runJobById } from "@/jobs/orchestrator";

const payloadSchema = z.object({
  jobId: z.string(),
  userId: z.string().uuid(),
});

/**
 * Endpoint interne déclenché par un système de job (cron, webhook...).
 * Protégé par INTERNAL_JOB_SECRET via Authorization header.
 */
export async function POST(req: Request) {
  // Vérification du secret interne
  const authHeader = req.headers.get("Authorization");
  const expectedSecret = process.env.INTERNAL_JOB_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobId } = payloadSchema.parse(body);
    const result = await runJobById(BigInt(jobId), {
      workerId: createJobRunnerId("legacy-riot-sync"),
    });

    if (result.status === "not_claimed") {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    if (result.status === "failed") {
      return NextResponse.json({ error: result.error, job: result }, { status: 500 });
    }

    if (result.status === "retried") {
      return NextResponse.json(
        { error: result.error, retryAt: result.runAt, job: result },
        { status: 503 }
      );
    }

    return NextResponse.json({ message: "Job termine", job: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error("Erreur execution job riot-sync:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
