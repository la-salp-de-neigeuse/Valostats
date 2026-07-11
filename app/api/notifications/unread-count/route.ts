import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { HttpError, jsonError } from "@/lib/security/request";
import { getUnreadCount } from "@/services/notifications/notifications-service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié");

    const count = await getUnreadCount(user.id);

    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    return jsonError(error);
  }
}
