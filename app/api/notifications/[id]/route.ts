import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { HttpError, jsonError } from "@/lib/security/request";
import { markAsRead, archiveNotification } from "@/services/notifications/notifications-service";

export const runtime = "nodejs";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié");

    const { id } = await params;
    const notificationId = BigInt(id);

    await markAsRead(user.id, notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié");

    const { id } = await params;
    const notificationId = BigInt(id);

    await archiveNotification(user.id, notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
