"use client";

import type { RankPoint } from "@/services/dashboard/types";

interface RankEvolutionWidgetProps {
  data: RankPoint[];
}

const RANK_ORDER: Record<string, number> = {
  IRON: 1, BRONZE: 2, SILVER: 3, GOLD: 4, PLATINUM: 5,
  DIAMOND: 6, ASCENDANT: 7, IMMORTAL: 8, RADIANT: 9,
};

function formatRank(rank: string, tier: number): string {
  const tiers = ["", "I", "II", "III"];
  return `${rank} ${tiers[tier] ?? ""}`.trim();
}

export function RankEvolutionWidget({ data }: RankEvolutionWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Évolution du rang</h3>
        <p className="text-sm text-text-muted">Aucune donnée de rang</p>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Évolution du rang</h3>
      <div className="space-y-1 max-h-72 overflow-y-auto scrollbar-none">
        {sorted.map((point, i) => {
          const prev = sorted[i - 1];
          const movedUp = prev ? (RANK_ORDER[point.rank] ?? 0) > (RANK_ORDER[prev.rank] ?? 0) : false;
          const movedDown = prev ? (RANK_ORDER[point.rank] ?? 0) < (RANK_ORDER[prev.rank] ?? 0) : false;
          const isFirst = i === 0;

          return (
            <div key={`${point.rank}-${point.tier}-${point.timestamp}`} className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-hover/30 transition-all cursor-default">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full ${
                  isFirst ? "bg-accent ring-2 ring-accent/30" : movedUp ? "bg-emerald-500" : movedDown ? "bg-red-500" : "bg-text-muted"
                }`} />
                {i < sorted.length - 1 && <div className="w-px h-6 bg-border mt-0.5" />}
              </div>
              <div className="flex items-center justify-between w-full min-w-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{formatRank(point.rank, point.tier)}</p>
                  <p className="text-[10px] text-text-muted">
                    {new Date(point.timestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                {movedUp && <span className="text-xs font-bold text-emerald-400 shrink-0">▲</span>}
                {movedDown && <span className="text-xs font-bold text-red-400 shrink-0">▼</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
