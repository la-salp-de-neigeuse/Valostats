import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { updateExtendedPrivacy } from "@/services/profile/profile-service";

export const runtime = "nodejs";

const extendedPrivacySchema = z.object({
  showGoals: z.boolean().optional(),
  showRecentMatches: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const body = await request.json();
    const input = extendedPrivacySchema.parse(body);

    await updateExtendedPrivacy(currentUser.id, input);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }
    return jsonError(error);
  }
}
