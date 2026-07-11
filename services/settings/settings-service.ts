import { prisma } from "@/lib/prisma/client";
import type { ProfileVisibility } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type {
  NotificationSettings,
  AiSettings,
  PrivacySettings,
  UserProfileSettings,
  SettingsData,
} from "./types";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_AI_SETTINGS,
  DEFAULT_OVERLAY_WIDGETS,
} from "./types";
import type {
  ProfileSettingsInput,
  NotificationSettingsInput,
  AiSettingsInput,
  PrivacySettingsInput,
  OverlaySettingsInput,
} from "@/lib/validation/settings";

function parseNotificationSettings(raw: unknown): NotificationSettings {
  const stored = raw as Record<string, Record<string, boolean>> | null;
  if (!stored) return { ...DEFAULT_NOTIFICATION_SETTINGS };
  return {
    email: { ...DEFAULT_NOTIFICATION_SETTINGS.email, ...stored.email },
    discord: { ...DEFAULT_NOTIFICATION_SETTINGS.discord, ...stored.discord },
    push: { ...DEFAULT_NOTIFICATION_SETTINGS.push, ...stored.push },
  };
}

function parseAiSettings(settings: {
  preferredProvider: string | null;
  preferredModel: string | null;
  temperature: number | null;
  maxTokens: number | null;
}): AiSettings {
  return {
    provider: (settings.preferredProvider as AiSettings["provider"]) ?? DEFAULT_AI_SETTINGS.provider,
    model: settings.preferredModel ?? DEFAULT_AI_SETTINGS.model,
    temperature: settings.temperature !== null ? Number(settings.temperature) : DEFAULT_AI_SETTINGS.temperature,
    maxTokens: settings.maxTokens ?? DEFAULT_AI_SETTINGS.maxTokens,
  };
}

export async function getSettings(userId: string): Promise<SettingsData> {
  const [user, riotAccount, overlayConfig] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        locale: true,
        timezone: true,
        visibility: true,
        settings: {
          select: {
            showRankPublicly: true,
            showMatchHistory: true,
            showAiScore: true,
            allowLeaderboard: true,
            preferredProvider: true,
            preferredModel: true,
            temperature: true,
            maxTokens: true,
            notificationSettings: true,
          },
        },
      },
    }),
    prisma.riotAccount.findUnique({
      where: { userId },
      select: { gameName: true, tagLine: true },
    }),
    prisma.overlayConfig.findUnique({
      where: { userId },
      select: { settings: true },
    }),
  ]);

  if (!user) throw new Error("Utilisateur introuvable.");

  const s = user.settings;
  const overlayStored = overlayConfig?.settings as Record<string, unknown> | null;

  return {
    profile: {
      name: user.name,
      riotGameName: riotAccount?.gameName ?? null,
      riotTagLine: riotAccount?.tagLine ?? null,
      locale: user.locale,
      timezone: user.timezone,
    },
    notifications: parseNotificationSettings(s?.notificationSettings),
    ai: parseAiSettings({
      preferredProvider: s?.preferredProvider ?? null,
      preferredModel: s?.preferredModel ?? null,
      temperature: s ? Number(s.temperature) : null,
      maxTokens: s?.maxTokens ?? null,
    }),
    privacy: {
      visibility: user.visibility,
      showRankPublicly: s?.showRankPublicly ?? false,
      showMatchHistory: s?.showMatchHistory ?? false,
      showAiScore: s?.showAiScore ?? false,
      allowLeaderboard: s?.allowLeaderboard ?? false,
    },
    overlayTheme: (overlayStored?.theme as string) ?? "dark",
    overlayWidgets: {
      ...DEFAULT_OVERLAY_WIDGETS,
      ...((overlayStored?.visibleWidgets as Record<string, boolean>) ?? {}),
    },
  };
}

export async function updateProfileSettings(
  userId: string,
  input: ProfileSettingsInput,
): Promise<UserProfileSettings> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      locale: input.locale,
      timezone: input.timezone,
    },
    select: {
      name: true,
      locale: true,
      timezone: true,
    },
  });

  return {
    name: user.name,
    riotGameName: null,
    riotTagLine: null,
    locale: user.locale,
    timezone: user.timezone,
  };
}

export async function updateNotificationSettings(
  userId: string,
  input: NotificationSettingsInput,
): Promise<NotificationSettings> {
  await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      notificationSettings: input as unknown as Prisma.InputJsonValue,
    },
    update: {
      notificationSettings: input as unknown as Prisma.InputJsonValue,
    },
  });

  return { ...input };
}

export async function updateAiSettings(
  userId: string,
  input: AiSettingsInput,
): Promise<AiSettings> {
  await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      preferredProvider: input.provider,
      preferredModel: input.model,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    },
    update: {
      preferredProvider: input.provider,
      preferredModel: input.model,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    },
  });

  return { ...input };
}

export async function updatePrivacySettings(
  userId: string,
  input: PrivacySettingsInput,
): Promise<PrivacySettings> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      visibility: input.visibility as ProfileVisibility,
      privacyVersion: { increment: 1 },
      settings: {
        upsert: {
          create: {
            showRankPublicly: input.showRankPublicly,
            showMatchHistory: input.showMatchHistory,
            showAiScore: input.showAiScore,
            allowLeaderboard: input.allowLeaderboard,
          },
          update: {
            showRankPublicly: input.showRankPublicly,
            showMatchHistory: input.showMatchHistory,
            showAiScore: input.showAiScore,
            allowLeaderboard: input.allowLeaderboard,
          },
        },
      },
    },
  });

  return { ...input };
}

export async function updateOverlaySettings(
  userId: string,
  input: OverlaySettingsInput,
): Promise<void> {
  const existing = await prisma.overlayConfig.findUnique({
    where: { userId },
    select: { settings: true },
  });

  const stored = (existing?.settings as Record<string, unknown>) ?? {};

  await prisma.overlayConfig.upsert({
    where: { userId },
    create: {
      userId,
      settings: {
        ...stored,
        theme: input.theme,
        visibleWidgets: input.widgets,
      } as Prisma.InputJsonValue,
    },
    update: {
      settings: {
        ...stored,
        theme: input.theme,
        visibleWidgets: input.widgets,
      } as Prisma.InputJsonValue,
    },
  });
}
