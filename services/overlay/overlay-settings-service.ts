import { prisma } from "@/lib/prisma/client";
import type { Prisma } from "@prisma/client";
import type { OverlaySettings, OverlayWidgetConfig } from "./types";
import { DEFAULT_OVERLAY_SETTINGS } from "./types";
import type { OverlaySettingsInput } from "@/lib/validation/settings";
import { cacheDelete } from "@/lib/cache/cache-service";
import { settingsKey } from "@/lib/cache/keys";

export async function getOverlaySettings(userId: string): Promise<OverlaySettings> {
  const config = await prisma.overlayConfig.findUnique({
    where: { userId },
  });

  if (!config) {
    return deepClone(DEFAULT_OVERLAY_SETTINGS);
  }

  const stored = config.settings as Record<string, unknown>;

  return {
    theme: (stored.theme as OverlaySettings["theme"]) ?? DEFAULT_OVERLAY_SETTINGS.theme,
    displayMode: (stored.displayMode as OverlaySettings["displayMode"]) ?? DEFAULT_OVERLAY_SETTINGS.displayMode,
    widgets: mergeWidgets(stored.widgets as OverlayWidgetConfig[] | undefined),
    colors: {
      ...DEFAULT_OVERLAY_SETTINGS.colors,
      ...(stored.colors as Record<string, string>),
    },
    size: (stored.size as OverlaySettings["size"]) ?? DEFAULT_OVERLAY_SETTINGS.size,
    font: (stored.font as OverlaySettings["font"]) ?? DEFAULT_OVERLAY_SETTINGS.font,
    transparency: (stored.transparency as number) ?? DEFAULT_OVERLAY_SETTINGS.transparency,
    animations: (stored.animations as boolean) ?? DEFAULT_OVERLAY_SETTINGS.animations,
    refreshInterval: (stored.refreshInterval as number) ?? DEFAULT_OVERLAY_SETTINGS.refreshInterval,
    showBorder: (stored.showBorder as boolean) ?? DEFAULT_OVERLAY_SETTINGS.showBorder,
    borderRadius: (stored.borderRadius as number) ?? DEFAULT_OVERLAY_SETTINGS.borderRadius,
    fontScale: (stored.fontScale as number) ?? DEFAULT_OVERLAY_SETTINGS.fontScale,
    shadow: (stored.shadow as boolean) ?? DEFAULT_OVERLAY_SETTINGS.shadow,
    shadowBlur: (stored.shadowBlur as number) ?? DEFAULT_OVERLAY_SETTINGS.shadowBlur,
  };
}

export async function saveOverlaySettings(
  userId: string,
  settings: OverlaySettings,
): Promise<void> {
  await prisma.overlayConfig.upsert({
    where: { userId },
    create: { userId, settings: settings as unknown as Prisma.InputJsonValue },
    update: { settings: settings as unknown as Prisma.InputJsonValue },
  });
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

  const mergedWidgets = (stored.widgets as OverlayWidgetConfig[] | undefined)?.map((w) => ({
    ...w,
    visible: input.widgets[w.type] ?? w.visible,
  })) ?? DEFAULT_OVERLAY_SETTINGS.widgets.map((def) => ({
    ...def,
    visible: input.widgets[def.type] ?? def.visible,
  }));

  await prisma.overlayConfig.upsert({
    where: { userId },
    create: {
      userId,
      settings: {
        ...stored,
        theme: input.theme,
        widgets: mergedWidgets,
      } as Prisma.InputJsonValue,
    },
    update: {
      settings: {
        ...stored,
        theme: input.theme,
        widgets: mergedWidgets,
      } as Prisma.InputJsonValue,
    },
  });

  await cacheDelete(settingsKey(userId));
}

function mergeWidgets(
  stored: OverlayWidgetConfig[] | undefined,
): OverlayWidgetConfig[] {
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    return DEFAULT_OVERLAY_SETTINGS.widgets;
  }

  const storedMap = new Map<string, OverlayWidgetConfig>();
  for (const w of stored) {
    storedMap.set(w.type, w);
  }

  return DEFAULT_OVERLAY_SETTINGS.widgets.map((def) => {
    const existing = storedMap.get(def.type);
    if (existing) {
      return {
        ...def,
        visible: existing.visible ?? def.visible,
        x: existing.x ?? def.x,
        y: existing.y ?? def.y,
        w: existing.w ?? def.w,
        h: existing.h ?? def.h,
      };
    }
    return { ...def };
  });
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
