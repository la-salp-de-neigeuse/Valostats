"use client";

import { WidgetCard } from "./WidgetCard";

export function WinStreakWidget({ streak }: { streak: number }) {
  return <WidgetCard label="Série" value={streak > 0 ? `${streak} V` : "—"} />;
}
