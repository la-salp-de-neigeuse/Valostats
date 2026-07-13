import { NextRequest, NextResponse } from "next/server";
import { createPreset, renamePreset, deletePreset, loadPreset } from "@/services/overlay/overlay-preset-service";
import { getCurrentUser } from "@/lib/auth/session";
import type { OverlaySettings } from "@/services/overlay/types";
import { HttpError, jsonError } from "@/lib/security/request";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentification requise.");

    const body = await req.json();

    if (body.action === "load") {
      if (!body.id) throw new HttpError(400, "ID du preset requis.");
      await loadPreset(body.id);
      return NextResponse.json({ success: true });
    }

    if (!body.name || !body.settings) {
      throw new HttpError(400, "Nom et paramètres requis.");
    }

    const preset = await createPreset(body.name, body.settings as OverlaySettings);
    return NextResponse.json(preset);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentification requise.");

    const body = await req.json();
    if (!body.id || !body.name) throw new HttpError(400, "ID et nom requis.");

    await renamePreset(body.id, body.name);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentification requise.");

    const body = await req.json();
    if (!body.id) throw new HttpError(400, "ID du preset requis.");

    await deletePreset(body.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
