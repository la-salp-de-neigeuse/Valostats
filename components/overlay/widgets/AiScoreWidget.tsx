"use client";

import { WidgetCard } from "./WidgetCard";

export function AiScoreWidget({ score }: { score: number | null }) {
  if (score === null) return null;
  return <WidgetCard label="Score IA" value={`${score}/100`} />;
}
