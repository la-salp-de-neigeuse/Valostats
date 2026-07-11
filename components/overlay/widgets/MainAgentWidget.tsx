"use client";

import { WidgetCard } from "./WidgetCard";

export function MainAgentWidget({ mainAgent }: { mainAgent: string | null }) {
  return <WidgetCard label="Agent principal" value={mainAgent ?? "—"} />;
}
