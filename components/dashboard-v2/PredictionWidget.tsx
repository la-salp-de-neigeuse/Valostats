"use client";

import Link from "next/link";

interface PredictionWidgetData {
  currentRankLabel: string;
  nextRankLabel: string;
  globalProgressionScore: number;
  probability: number;
  estimatedMatches: number;
  slope: number;
  winProbability: number;
}

export function PredictionWidget({ data }: { data: PredictionWidgetData }) {
  const scoreColor = data.globalProgressionScore >= 75 ? "text-emerald-400"
    : data.globalProgressionScore >= 50 ? "text-amber-400" : "text-error";
  const strokeColor = data.globalProgressionScore >= 75 ? "#22c55e"
    : data.globalProgressionScore >= 50 ? "#f59e0b" : "var(--error)";
  const trendLabel = data.slope > 0.02 ? "En progression" : data.slope < -0.02 ? "En déclin" : "Stable";
  const trendColor = data.slope > 0.02 ? "text-emerald-400" : data.slope < -0.02 ? "text-error" : "text-amber-400";

  return (
    <div className="p-5 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Prédiction de Rang</h3>
        <Link href="/prediction" className="text-xs text-accent hover:text-accent-hover transition-colors font-medium">
          Voir tout →
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" style={{ stroke: "var(--border)" }} strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke={strokeColor} strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(data.globalProgressionScore / 100) * 97.39} 97.39`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-lg font-black tabular-nums ${scoreColor}`}>{data.globalProgressionScore}</span>
          </div>
        </div>
        <div>
          <p className="text-text-muted text-xs mb-0.5">Rang visé</p>
          <p className="text-lg font-bold text-text-primary">{data.nextRankLabel}</p>
          <p className="text-xs text-text-muted">Depuis {data.currentRankLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface-hover/30 rounded-lg p-3">
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Rank Up</p>
          <p className="text-lg font-bold text-text-primary tabular-nums">{data.probability}%</p>
        </div>
        <div className="bg-surface-hover/30 rounded-lg p-3">
          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Matchs estimés</p>
          <p className="text-lg font-bold text-text-primary tabular-nums">{data.estimatedMatches < Infinity ? `~${data.estimatedMatches}` : "—"}</p>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-border">
        <p className={`text-sm font-semibold ${trendColor}`}>{trendLabel}</p>
      </div>
    </div>
  );
}
