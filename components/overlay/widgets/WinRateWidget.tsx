"use client";

import { WidgetCard } from "./WidgetCard";

export function WinRateWidget({ winRate }: { winRate: number }) {
  return <WidgetCard label="Winrate" value={`${winRate.toFixed(1)}%`} accent />;
}
