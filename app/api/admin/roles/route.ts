import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError, readJsonBody } from "@/lib/security/request";
import { canManageRoles } from "@/services/roles/types";
import { updateUserRole } from "@/services/roles/role-service";
import type { UserRole } from "@prisma/client";

export const runtime = "nodejs";

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["OWNER", "DEVELOPER", "ADMINISTRATOR", "MODERATOR", "PREMIUM", "FRIEND", "USER"]),
});

export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw new HttpError(401, "Authentification requise.");
    }

    if (!canManageRoles(currentUser.role)) {
      throw new HttpError(403, "Vous n'avez pas la permission de modifier les rôles.");
    }

    const body = await readJsonBody(request);
    const input = updateRoleSchema.parse(body);

    await updateUserRole(input.userId, input.role as UserRole, currentUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }

    return jsonError(error);
  }
}
