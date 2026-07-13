"use server";

import { prisma } from "@/lib/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import type { OverlaySettings } from "@/services/overlay/types";

export interface OverlayPresetData {
  id: string;
  name: string;
  settings: OverlaySettings;
  createdAt: Date;
  updatedAt: Date;
}

function getPlanLimit(plan: string): number {
  if (plan === "PRO" || plan === "TEAM") return 10;
  return 3;
}

export async function getUserPresets(): Promise<OverlayPresetData[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentification requise.");

  const presets = await prisma.overlayPreset.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, settings: true, createdAt: true, updatedAt: true },
  });

  return presets as unknown as OverlayPresetData[];
}

export async function getPresetById(id: string): Promise<OverlayPresetData | null> {
  const preset = await prisma.overlayPreset.findUnique({
    where: { id },
    select: { id: true, name: true, settings: true, createdAt: true, updatedAt: true, userId: true },
  });

  if (!preset) return null;

  return {
    id: preset.id,
    name: preset.name,
    settings: preset.settings as unknown as OverlaySettings,
    createdAt: preset.createdAt,
    updatedAt: preset.updatedAt,
  };
}

export async function createPreset(name: string, settings: OverlaySettings): Promise<OverlayPresetData> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentification requise.");

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 60) throw new Error("Le nom doit contenir entre 1 et 60 caractères.");

  const limit = getPlanLimit(user.plan);
  const count = await prisma.overlayPreset.count({ where: { userId: user.id } });

  if (count >= limit) {
    throw new Error(`LIMIT_REACHED:${limit}`);
  }

  const existing = await prisma.overlayPreset.findUnique({
    where: { userId_name: { userId: user.id, name: trimmed } },
  });

  if (existing) throw new Error("Un preset avec ce nom existe déjà.");

  const preset = await prisma.overlayPreset.create({
    data: {
      userId: user.id,
      name: trimmed,
      settings: settings as object,
    },
    select: { id: true, name: true, settings: true, createdAt: true, updatedAt: true },
  });

  return preset as unknown as OverlayPresetData;
}

export async function renamePreset(id: string, name: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentification requise.");

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 60) throw new Error("Le nom doit contenir entre 1 et 60 caractères.");

  const preset = await prisma.overlayPreset.findUnique({ where: { id } });
  if (!preset || preset.userId !== user.id) throw new Error("Preset introuvable.");

  const existing = await prisma.overlayPreset.findUnique({
    where: { userId_name: { userId: user.id, name: trimmed } },
  });

  if (existing && existing.id !== id) throw new Error("Un preset avec ce nom existe déjà.");

  await prisma.overlayPreset.update({
    where: { id },
    data: { name: trimmed },
  });
}

export async function deletePreset(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentification requise.");

  const preset = await prisma.overlayPreset.findUnique({ where: { id } });
  if (!preset || preset.userId !== user.id) throw new Error("Preset introuvable.");

  await prisma.overlayPreset.delete({ where: { id } });
}

export async function loadPreset(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentification requise.");

  const preset = await prisma.overlayPreset.findUnique({ where: { id } });
  if (!preset || preset.userId !== user.id) throw new Error("Preset introuvable.");

  await prisma.overlayConfig.upsert({
    where: { userId: user.id },
    create: { userId: user.id, settings: preset.settings as object },
    update: { settings: preset.settings as object },
  });
}

export async function getPresetOwnerSlug(presetId: string): Promise<string | null> {
  const preset = await prisma.overlayPreset.findUnique({
    where: { id: presetId },
    select: { userId: true },
  });

  if (!preset) return null;

  const user = await prisma.user.findUnique({
    where: { id: preset.userId },
    select: { publicSlug: true, visibility: true },
  });

  if (!user) return null;

  return user.publicSlug;
}

export type OverlayPresetListItem = OverlayPresetData;
