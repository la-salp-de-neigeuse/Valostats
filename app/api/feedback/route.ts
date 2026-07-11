import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError, readJsonBody } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createFeedback, getFeedbacks } from "@/services/feedback/feedback-service";
import { canViewFeedback } from "@/services/roles/types";

export const runtime = "nodejs";

const createFeedbackSchema = z.object({
  type: z.enum(["BUG", "IDEA", "SUGGESTION", "POSITIVE"]),
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(200, "Le titre ne peut pas dépasser 200 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères").max(5000, "La description ne peut pas dépasser 5000 caractères"),
  pageUrl: z.string().optional(),
  browser: z.string().optional(),
  operatingSystem: z.string().optional(),
  userAgent: z.string().optional(),
  screenshotUrl: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const rateLimitResult = await checkRateLimit(currentUser.id, "feedback");
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Vous avez envoyé trop de feedbacks. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)) } },
      );
    }

    const body = await readJsonBody(request);
    const input = createFeedbackSchema.parse(body);

    const feedback = await createFeedback({
      userId: currentUser.id,
      type: input.type,
      title: input.title,
      description: input.description,
      pageUrl: input.pageUrl,
      browser: input.browser,
      operatingSystem: input.operatingSystem,
      userAgent: input.userAgent,
      screenshotUrl: input.screenshotUrl,
    });

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }
    return jsonError(error);
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
    const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20")));
    const typeParam = url.searchParams.get("type");
    const statusParam = url.searchParams.get("status");
    const priorityParam = url.searchParams.get("priority");

    const isAdmin = canViewFeedback(currentUser.role);
    const userId = isAdmin && url.searchParams.get("userId")
      ? url.searchParams.get("userId")!
      : isAdmin ? undefined : currentUser.id;

    const feedbacks = await getFeedbacks({
      page,
      pageSize,
      type: typeParam as never || undefined,
      status: statusParam as never || undefined,
      priority: priorityParam as never || undefined,
      userId,
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    return jsonError(error);
  }
}
