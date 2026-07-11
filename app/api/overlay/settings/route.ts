import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { saveOverlaySettings } from "@/services/overlay/overlay-settings-service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);

    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié");

    const body = await req.json();
    await saveOverlaySettings(user.id, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
