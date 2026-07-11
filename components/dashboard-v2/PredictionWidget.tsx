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
  const scoreColor =
    data.globalProgressionScore >= 75
      ? "text-emerald-400"
      : data.globalProgressionScore >= 50
      ? "text-amber-400"
      : "text-rose-400";

  const trendLabel =
    data.slope > 0.02 ? "↑ En progression" : data.slope < -0.02 ? "↓ En déclin" : "→ Stable";
  const trendColor =
    data.slope > 0.02 ? "text-emerald-400" : data.slope < -0.02 ? "text-rose-400" : "text-amber-400";

  return (
    <div className="p-5 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Prédiction de Rang</h3>
        <Link
          href="/prediction"
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
        >
          Voir tout →
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">Rang Visé</p>
          <p className="text-xl font-bold text-white">
            {data.nextRankLabel}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Depuis {data.currentRankLabel}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-800" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                fill="transparent"
                className={scoreColor}
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - data.globalProgressionScore / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-base font-black ${scoreColor}`}>{data.globalProgressionScore}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500">Score</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/40 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Rank Up</p>
          <p className="text-base font-bold text-white">{data.probability}%</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-3">
          <p className="text-xs text-slate-500 mb-1">Matchs estimés</p>
          <p className="text-base font-bold text-white">
            {data.estimatedMatches < Infinity ? `~${data.estimatedMatches}` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-2 border-t border-slate-800">
        <p className={`text-sm font-semibold ${trendColor}`}>{trendLabel}</p>
      </div>
    </div>
  );
}
