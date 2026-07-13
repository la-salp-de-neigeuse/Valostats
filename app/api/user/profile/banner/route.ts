import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { saveBanner, deleteBanner } from "@/services/profile/profile-service";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 500 * 1024;
const ALLOWED_PREFIXES = [
  "data:image/jpeg;base64,",
  "data:image/png;base64,",
  "data:image/webp;base64,",
  "data:image/gif;base64,",
];

function validateDataUrl(dataUrl: string): boolean {
  if (!ALLOWED_PREFIXES.some((p) => dataUrl.startsWith(p))) return false;
  const base64Data = dataUrl.split(",")[1];
  if (!base64Data) return false;
  try {
    const decodedLength = Buffer.from(base64Data, "base64").length;
    return decodedLength <= MAX_IMAGE_SIZE;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    const body = await request.json();
    const { banner } = body;

    if (!banner || typeof banner !== "string") {
      return NextResponse.json({ error: "Image invalide." }, { status: 422 });
    }

    if (!validateDataUrl(banner)) {
      return NextResponse.json(
        { error: "Format d'image non supporté ou fichier trop volumineux (max 500 KB)." },
        { status: 422 }
      );
    }

    await saveBanner(currentUser.id, banner);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new HttpError(401, "Authentification requise.");

    await deleteBanner(currentUser.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
