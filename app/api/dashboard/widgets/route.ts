import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getWidgetLayout, saveWidgetLayout } from "@/services/dashboard/widget-layout-service";
import { jsonError } from "@/lib/security/request";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    const layout = await getWidgetLayout(session.user.id);
    return NextResponse.json(layout);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    const body = await req.json();
    await saveWidgetLayout(session.user.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
