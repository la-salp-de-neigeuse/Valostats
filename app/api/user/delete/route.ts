import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError, readJsonBody } from "@/lib/security/request";
import { deleteAccountSchema } from "@/lib/validation/user";
import { deleteUserAccount } from "@/services/users/user-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new HttpError(401, "Authentification requise.");
    }

    const body = await readJsonBody(request);
    const input = deleteAccountSchema.parse(body);
    await deleteUserAccount(currentUser.id, input);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }

    return jsonError(error);
  }
}
