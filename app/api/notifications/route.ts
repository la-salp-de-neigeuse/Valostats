import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import {
  getNotifications,
  markAllAsRead,
} from "@/services/notifications/notifications-service";
import type { NotificationType } from "@/services/notifications/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié");

    const url = new URL(request.url);
    const page = Math.max(1, Math.min(parseInt(url.searchParams.get("page") ?? "1", 10) || 1, 1000));
    const pageSize = Math.max(1, Math.min(parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20, 100));
    const typeParam = url.searchParams.get("type");
    const includeArchived = url.searchParams.get("includeArchived") === "true";

    const result = await getNotifications(user.id, {
      page,
      pageSize,
      type: (typeParam as NotificationType) ?? undefined,
      includeArchived,
    });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié");

    const count = await markAllAsRead(user.id);

    return NextResponse.json({ markedAsRead: count });
  } catch (error) {
    return jsonError(error);
  }
}
