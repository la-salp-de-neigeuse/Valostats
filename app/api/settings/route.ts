import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { updateSettingsSchema } from "@/lib/validation/settings";
import {
  getSettings,
  updateProfileSettings,
  updateNotificationSettings,
  updateAiSettings,
} from "@/services/settings/settings-service";
import { updateOverlaySettings } from "@/services/overlay/overlay-settings-service";
import { updatePrivacySettings } from "@/services/privacy/privacy-service";
import { assertSameOrigin, HttpError, jsonError, readJsonBody } from "@/lib/security/request";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié.");

    const settings = await getSettings(user.id);
    return NextResponse.json(settings);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: Request) {
  try {
    assertSameOrigin(req);

    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié.");

    const body = await readJsonBody(req);
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { profile, notifications, ai, privacy, overlay } = parsed.data;
    const results: Record<string, unknown> = {};

    if (profile) {
      results.profile = await updateProfileSettings(user.id, profile);
    }
    if (notifications) {
      results.notifications = await updateNotificationSettings(user.id, notifications);
    }
    if (ai) {
      results.ai = await updateAiSettings(user.id, ai);
    }
    if (privacy) {
      results.privacy = await updatePrivacySettings(user.id, privacy);
    }
    if (overlay) {
      await updateOverlaySettings(user.id, overlay);
      results.overlay = { success: true };
    }

    return NextResponse.json(results);
  } catch (error) {
    return jsonError(error);
  }
}
