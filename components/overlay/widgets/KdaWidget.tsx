"use client";

import { WidgetCard } from "./WidgetCard";

export function KdaWidget({ kda }: { kda: number }) {
  return <WidgetCard label="KDA" value={kda.toFixed(2)} />;
}
