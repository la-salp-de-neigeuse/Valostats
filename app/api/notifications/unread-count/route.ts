import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getUnreadCount } from "@/services/notifications/notifications-service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const count = await getUnreadCount(session.user.id);

  return NextResponse.json({ unreadCount: count });
}
