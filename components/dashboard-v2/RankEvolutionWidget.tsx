"use client";

import type { RankPoint } from "@/services/dashboard/types";

interface RankEvolutionWidgetProps {
  data: RankPoint[];
}

export function RankEvolutionWidget({ data }: RankEvolutionWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Évolution du rang</h3>
        <p className="text-sm text-slate-500">Aucune donnée de rang</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Évolution du rang</h3>
      <div className="space-y-3 max-h-72 overflow-y-auto">
        {data.map((point, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              {i < data.length - 1 && <div className="w-px h-6 bg-slate-700" />}
            </div>
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-sm font-medium text-white">{formatRank(point.rank, point.tier)}</p>
                <p className="text-xs text-slate-500">
                  {new Date(point.timestamp).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
              {i > 0 && (
                <span className={`text-xs font-semibold ${
                  isRankHigher(data[i - 1], point) ? "text-emerald-500" : "text-red-500"
                }`}>
                  {isRankHigher(data[i - 1], point) ? "▲" : "▼"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatRank(rank: string, tier: number): string {
  const tiers = ["", "I", "II", "III"];
  return `${rank} ${tiers[tier] ?? ""}`.trim();
}

function isRankHigher(prev: RankPoint, curr: RankPoint): boolean {
  const rankOrder: Record<string, number> = {
    IRON: 1, BRONZE: 2, SILVER: 3, GOLD: 4, PLATINUM: 5, DIAMOND: 6, ASCENDANT: 7,
    IMMORTAL: 8, RADIANT: 9,
  };
  const prevVal = rankOrder[prev.rank] ?? 0;
  const currVal = rankOrder[curr.rank] ?? 0;
  return currVal > prevVal || (currVal === prevVal && curr.tier > prev.tier);
}
