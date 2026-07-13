import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPresetById, getPresetOwnerSlug } from "@/services/overlay/overlay-preset-service";
import { getOverlayData } from "@/services/overlay/overlay-service";
import { OverlayRenderer } from "@/components/overlay/OverlayRenderer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overlay - Preset",
  description: "Overlay partagé pour streamers Valorant.",
  robots: { index: false, follow: false },
};

export default async function OverlayPresetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const preset = await getPresetById(id);
  if (!preset) notFound();

  const ownerSlug = await getPresetOwnerSlug(id);
  if (!ownerSlug) notFound();

  const data = await getOverlayData(ownerSlug, true);
  if (!data) notFound();

  const presetData = { ...data, settings: preset.settings };

  return <OverlayRenderer initialData={presetData} slug={ownerSlug} />;
}
