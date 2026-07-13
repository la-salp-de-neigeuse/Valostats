"use client";

import type { TimelineEntry } from "@/services/dashboard/types";

interface TimelineWidgetProps {
  data: TimelineEntry[];
}

function WinIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LossIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function TimelineWidget({ data }: TimelineWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Timeline</h3>
        <p className="text-sm text-text-muted">Aucun match récent</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Matchs récents</h3>
      <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-none">
        {sorted.map((entry) => {
          const isWin = entry.result === "WIN";
          return (
            <div
              key={entry.id}
              className={`group flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-default ${
                isWin
                  ? "bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]"
                  : "bg-red-500/[0.04] hover:bg-red-500/[0.08]"
              }`}
            >
              <div className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-md ${
                isWin ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}>
                {isWin ? <WinIcon /> : <LossIcon />}
              </div>
              <span className={`text-xs font-bold w-16 shrink-0 ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                {isWin ? "VICTOIRE" : "DÉFAITE"}
              </span>
              <span className="text-xs text-text-secondary w-16 truncate hidden sm:inline">{entry.mapName}</span>
              <span className="text-xs text-text-muted w-12 truncate hidden sm:inline">{entry.agentName}</span>
              <span className="text-xs tabular-nums text-text-primary font-medium">
                {entry.kills}<span className="text-text-muted">/</span>{entry.deaths}<span className="text-text-muted">/</span>{entry.assists}
              </span>
              <span className="text-[10px] text-text-muted ml-auto shrink-0">
                {new Date(entry.playedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
