import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError, readJsonBody } from "@/lib/security/request";
import {
  getFeedbackById,
  updateFeedbackStatus,
  updateFeedbackPriority,
  updateFeedbackAdminNote,
  deleteFeedback,
} from "@/services/feedback/feedback-service";
import { canViewFeedback, canModifyFeedbackStatus, canDeleteFeedback, canManageFeedback } from "@/services/roles/types";

export const runtime = "nodejs";

const statusSchema = z.object({
  action: z.literal("status"),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "REJECTED", "DUPLICATE"]),
});

const prioritySchema = z.object({
  action: z.literal("priority"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

const noteSchema = z.object({
  action: z.literal("note"),
  adminNote: z.string().max(2000, "La note ne peut pas dépasser 2000 caractères"),
});

const patchSchema = z.discriminatedUnion("action", [statusSchema, prioritySchema, noteSchema]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const { id } = await params;
    const feedbackId = BigInt(id);
    const feedback = await getFeedbackById(feedbackId);

    if (!feedback) throw new HttpError(404, "Feedback introuvable.");

    if (feedback.userId !== currentUser.id && !canViewFeedback(currentUser.role)) {
      throw new HttpError(403, "Accès refusé.");
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const { id } = await params;
    const feedbackId = BigInt(id);

    const body = await readJsonBody(request);
    const input = patchSchema.parse(body);

    if (input.action === "status") {
      if (!canModifyFeedbackStatus(currentUser.role)) throw new HttpError(403, "Vous n'avez pas la permission de modifier le statut.");

      const feedback = await updateFeedbackStatus(feedbackId, input.status);
      if (!feedback) throw new HttpError(404, "Feedback introuvable.");

      return NextResponse.json({ feedback });
    }

    if (input.action === "priority") {
      if (!canManageFeedback(currentUser.role)) throw new HttpError(403, "Vous n'avez pas la permission de modifier la priorité.");

      const feedback = await updateFeedbackPriority(feedbackId, input.priority);
      if (!feedback) throw new HttpError(404, "Feedback introuvable.");

      return NextResponse.json({ feedback });
    }

    if (input.action === "note") {
      if (!canManageFeedback(currentUser.role)) throw new HttpError(403, "Vous n'avez pas la permission d'ajouter une note.");

      const feedback = await updateFeedbackAdminNote(feedbackId, input.adminNote);
      if (!feedback) throw new HttpError(404, "Feedback introuvable.");

      return NextResponse.json({ feedback });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(_request);

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");
    if (!canDeleteFeedback(currentUser.role)) throw new HttpError(403, "Vous n'avez pas la permission de supprimer un feedback.");

    const { id } = await params;
    const feedbackId = BigInt(id);
    const deleted = await deleteFeedback(feedbackId);

    if (!deleted) throw new HttpError(404, "Feedback introuvable.");

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
