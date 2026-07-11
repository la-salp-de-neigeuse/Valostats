"use client";

import { WidgetCard } from "./WidgetCard";

export function RankWidget({ rank, rankTier }: { rank: string | null; rankTier: number | null }) {
  const tiers = ["", "I", "II", "III"];
  const display = rank ? `${rank} ${tiers[rankTier ?? 0] ?? ""}`.trim() : "Non classé";
  return <WidgetCard label="Rang" value={display} />;
}
