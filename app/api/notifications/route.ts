import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  getNotifications,
  markAllAsRead,
} from "@/services/notifications/notifications-service";
import type { NotificationType } from "@/services/notifications/types";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10);
  const typeParam = url.searchParams.get("type");
  const includeArchived = url.searchParams.get("includeArchived") === "true";

  const result = await getNotifications(session.user.id, {
    page,
    pageSize,
    type: (typeParam as NotificationType) ?? undefined,
    includeArchived,
  });

  return NextResponse.json(result);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const count = await markAllAsRead(session.user.id);

  return NextResponse.json({ markedAsRead: count });
}
