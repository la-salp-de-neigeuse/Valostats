"use client";

import type { ActivityEntry } from "@/services/dashboard/types";

interface RecentActivityWidgetProps {
  data: ActivityEntry[];
}

const ACTIVITY_META: Record<ActivityEntry["type"], { icon: string; ring: string }> = {
  sync: { icon: "↻", ring: "bg-blue-500/10 text-blue-400" },
  analysis: { icon: "✨", ring: "bg-accent-light text-accent" },
  goal: { icon: "🎯", ring: "bg-emerald-500/10 text-emerald-400" },
  badge: { icon: "🏅", ring: "bg-amber-500/10 text-amber-400" },
  rank: { icon: "⬆", ring: "bg-violet-500/10 text-violet-400" },
};

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export function RecentActivityWidget({ data }: RecentActivityWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Activité récente</h3>
        <p className="text-sm text-text-muted">Aucune activité</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Activité récente</h3>
      <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-none">
        {data.map((entry) => {
          const meta = ACTIVITY_META[entry.type];
          return (
            <div key={entry.id} className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-hover/30 transition-all">
              <div className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs ${meta.ring}`}>
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary truncate group-hover:text-accent transition-colors">{entry.title}</p>
                {entry.description && <p className="text-xs text-text-muted truncate mt-0.5">{entry.description}</p>}
              </div>
              <span className="text-[10px] text-text-muted shrink-0">{formatRelativeTime(entry.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
