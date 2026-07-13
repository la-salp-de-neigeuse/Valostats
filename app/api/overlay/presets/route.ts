import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserPresets } from "@/services/overlay/overlay-preset-service";
import { HttpError, jsonError } from "@/lib/security/request";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Authentification requise.");

    const presets = await getUserPresets();
    return NextResponse.json(presets);
  } catch (error) {
    return jsonError(error);
  }
}
