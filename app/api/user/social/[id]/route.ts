import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { updateSocialLinkSchema } from "@/lib/validation/social";
import { updateSocialLink, deleteSocialLink } from "@/services/social/social-service";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const { id } = await params;
    const body = await request.json();
    const input = updateSocialLinkSchema.parse(body);
    const link = await updateSocialLink(id, currentUser.id, input);

    return NextResponse.json({ link });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }
    return jsonError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const { id } = await params;
    await deleteSocialLink(id, currentUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
