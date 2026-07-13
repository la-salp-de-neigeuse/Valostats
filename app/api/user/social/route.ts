import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { createSocialLinkSchema } from "@/lib/validation/social";
import { getUserSocialLinks, createSocialLink } from "@/services/social/social-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const links = await getUserSocialLinks(currentUser.id);
    return NextResponse.json({ links });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const body = await request.json();
    const input = createSocialLinkSchema.parse(body);
    const link = await createSocialLink(currentUser.id, input);

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }
    return jsonError(error);
  }
}
