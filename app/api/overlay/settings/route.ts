import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { saveOverlaySettings } from "@/services/overlay/overlay-settings-service";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await req.json();
  await saveOverlaySettings(session.user.id, body);

  return NextResponse.json({ success: true });
}
