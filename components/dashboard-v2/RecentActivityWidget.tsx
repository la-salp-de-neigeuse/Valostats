"use client";

import type { ActivityEntry } from "@/services/dashboard/types";

interface RecentActivityWidgetProps {
  data: ActivityEntry[];
}

const activityIcons: Record<ActivityEntry["type"], string> = {
  sync: "↻",
  analysis: "✨",
  goal: "🎯",
  badge: "🏅",
  rank: "⬆",
};

export function RecentActivityWidget({ data }: RecentActivityWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Activité récente</h3>
        <p className="text-sm text-slate-500">Aucune activité</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Activité récente</h3>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {data.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/30 transition-colors">
            <span className="text-lg shrink-0">{activityIcons[entry.type]}</span>
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{entry.title}</p>
              {entry.description && (
                <p className="text-xs text-slate-500 truncate">{entry.description}</p>
              )}
            </div>
            <span className="text-xs text-slate-600 ml-auto shrink-0">
              {formatRelativeTime(entry.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
