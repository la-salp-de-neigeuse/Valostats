import { NextRequest, NextResponse } from "next/server";
import { getOverlayData } from "@/services/overlay/overlay-service";
import { getPresetById, getPresetOwnerSlug } from "@/services/overlay/overlay-preset-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const presetId = req.nextUrl.searchParams.get("presetId");

  const skipVisibilityCheck = !!presetId;
  let data = await getOverlayData(slug, skipVisibilityCheck);

  if (!data) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  if (presetId) {
    const ownerSlug = await getPresetOwnerSlug(presetId);
    if (ownerSlug !== slug) {
      return NextResponse.json({ error: "Preset introuvable" }, { status: 404 });
    }

    const preset = await getPresetById(presetId);
    if (!preset) {
      return NextResponse.json({ error: "Preset introuvable" }, { status: 404 });
    }

    data = { ...data, settings: preset.settings };
  }

  return NextResponse.json(data);
}
