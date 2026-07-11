"use client";

import type { VsAverage } from "@/services/dashboard/types";

interface VsAverageWidgetProps {
  data: VsAverage[];
}

export function VsAverageWidget({ data }: VsAverageWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">vs Moyenne</h3>
        <p className="text-sm text-slate-500">Pas assez de données</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => Math.max(d.playerValue, d.averageValue)), 1);

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-white mb-4">vs Moyenne</h3>
      <div className="space-y-3">
        {data.map((stat) => {
          const isBetter = stat.higherIsBetter
            ? stat.playerValue >= stat.averageValue
            : stat.playerValue <= stat.averageValue;
          const playerPct = (stat.playerValue / maxValue) * 100;
          const avgPct = (stat.averageValue / maxValue) * 100;

          return (
            <div key={stat.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">{stat.label}</span>
                <span className={`font-semibold ${isBetter ? "text-emerald-500" : "text-red-500"}`}>
                  {stat.playerValue.toFixed(1)}{stat.unit}
                </span>
              </div>
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-rose-500/30 rounded-full transition-all"
                  style={{ width: `${avgPct}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${playerPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600 mt-0.5">
                <span>Moy. {stat.averageValue.toFixed(1)}{stat.unit}</span>
                <span>Vous</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
