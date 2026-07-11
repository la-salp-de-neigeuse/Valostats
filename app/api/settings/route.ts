import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { updateSettingsSchema } from "@/lib/validation/settings";
import {
  getSettings,
  updateProfileSettings,
  updateNotificationSettings,
  updateAiSettings,
  updatePrivacySettings,
  updateOverlaySettings,
} from "@/services/settings/settings-service";
import { assertSameOrigin, readJsonBody, jsonError } from "@/lib/security/request";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    const settings = await getSettings(session.user.id);
    return NextResponse.json(settings);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(req: Request) {
  try {
    assertSameOrigin(req);
  } catch (error) {
    return jsonError(error);
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    return jsonError(error);
  }

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { profile, notifications, ai, privacy, overlay } = parsed.data;

  try {
    const results: Record<string, unknown> = {};

    if (profile) {
      results.profile = await updateProfileSettings(session.user.id, profile);
    }
    if (notifications) {
      results.notifications = await updateNotificationSettings(session.user.id, notifications);
    }
    if (ai) {
      results.ai = await updateAiSettings(session.user.id, ai);
    }
    if (privacy) {
      results.privacy = await updatePrivacySettings(session.user.id, privacy);
    }
    if (overlay) {
      await updateOverlaySettings(session.user.id, overlay);
      results.overlay = { success: true };
    }

    return NextResponse.json(results);
  } catch (error) {
    return jsonError(error);
  }
}
