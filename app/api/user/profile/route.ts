import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError, readJsonBody } from "@/lib/security/request";
import { updateProfileSchema } from "@/lib/validation/user";
import { updateUserProfile } from "@/services/users/user-service";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new HttpError(401, "Authentification requise.");
    }

    const body = await readJsonBody(request);
    const input = updateProfileSchema.parse(body);
    const user = await updateUserProfile(currentUser.id, input);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        publicSlug: user.publicSlug,
        privacyVersion: user.privacyVersion,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }

    return jsonError(error);
  }
}
