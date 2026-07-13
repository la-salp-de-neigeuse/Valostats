"use client";

import type { VsAverage } from "@/services/dashboard/types";

interface VsAverageWidgetProps {
  data: VsAverage[];
}

export function VsAverageWidget({ data }: VsAverageWidgetProps) {
  if (data.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">vs Moyenne</h3>
        <p className="text-sm text-text-muted">Pas assez de données</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">vs Moyenne</h3>
      <div className="space-y-4">
        {data.map((stat) => {
          const isBetter = stat.higherIsBetter
            ? stat.playerValue >= stat.averageValue
            : stat.playerValue <= stat.averageValue;
          const maxVal = Math.max(stat.playerValue, stat.averageValue, 0.01);
          const playerPct = (stat.playerValue / maxVal) * 100;

          return (
            <div key={stat.label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-text-muted font-medium">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">
                    Vous <span className={`font-bold ${isBetter ? "text-emerald-400" : "text-red-400"}`}>
                      {stat.playerValue.toFixed(1)}{stat.unit}
                    </span>
                  </span>
                  <span className="text-[10px] text-text-muted">vs</span>
                  <span className="text-xs text-text-muted">
                    Moy. <span className="font-medium text-text-secondary">{stat.averageValue.toFixed(1)}{stat.unit}</span>
                  </span>
                </div>
              </div>
              <div className="relative h-2.5 bg-surface rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-accent/15 rounded-full transition-all" style={{ width: `${playerPct}%` }} />
                <div className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all" style={{ width: `${playerPct}%`, opacity: 0.4 }} />
              </div>
              <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
                <span>0</span>
                <span>{maxVal.toFixed(1)}{stat.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
