"use client";

import { WidgetCard } from "./WidgetCard";

export function SyncTimeWidget({ syncTimeAgo }: { syncTimeAgo: string | null }) {
  return <WidgetCard label="Dernière sync" value={syncTimeAgo ?? "Jamais"} />;
}
