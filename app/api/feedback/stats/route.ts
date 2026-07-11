import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { HttpError, jsonError } from "@/lib/security/request";
import { getFeedbackStats } from "@/services/feedback/feedback-service";
import { canViewFeedback } from "@/services/roles/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");
    if (!canViewFeedback(currentUser.role)) throw new HttpError(403, "Accès refusé.");

    const stats = await getFeedbackStats();
    return NextResponse.json(stats);
  } catch (error) {
    return jsonError(error);
  }
}
