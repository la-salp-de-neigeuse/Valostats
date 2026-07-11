import { NextResponse } from "next/server";
import { getOverlayData } from "@/services/overlay/overlay-service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await getOverlayData(slug);

  if (!data) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json(data);
}
