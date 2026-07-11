"use client";

import type { TimelineEntry } from "@/services/dashboard/types";

interface TimelineWidgetProps {
  data: TimelineEntry[];
}

export function TimelineWidget({ data }: TimelineWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Timeline</h3>
        <p className="text-sm text-slate-500">Aucun match récent</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Timeline</h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {data.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-2 rounded-lg text-xs ${
              entry.result === "WIN" ? "bg-emerald-500/10" : "bg-red-500/10"
            }`}
          >
            <span
              className={`shrink-0 w-2 h-2 rounded-full ${
                entry.result === "WIN" ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <span className="text-white font-medium w-12">{entry.result === "WIN" ? "VICTOIRE" : "DÉFAITE"}</span>
            <span className="text-slate-400 w-16 truncate">{entry.mapName}</span>
            <span className="text-slate-400 w-16 truncate">{entry.agentName}</span>
            <span className="text-slate-300">
              {entry.kills}/{entry.deaths}/{entry.assists}
            </span>
            <span className="text-slate-500 ml-auto">
              {new Date(entry.playedAt).toLocaleDateString("fr-FR", {
                day: "numeric", month: "short",
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
