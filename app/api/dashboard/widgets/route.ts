import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { getWidgetLayout, saveWidgetLayout } from "@/services/dashboard/widget-layout-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié.");

    const layout = await getWidgetLayout(user.id);
    return NextResponse.json(layout);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: Request) {
  try {
    assertSameOrigin(req);
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié.");

    const body = await req.json();
    await saveWidgetLayout(user.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
