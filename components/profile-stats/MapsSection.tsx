"use client";

import type { MapAggregate } from "@/services/stats/aggregate-stats-service";

function winRateColor(rate: number): string {
  if (rate >= 55) return "text-emerald-400";
  if (rate >= 45) return "text-yellow-400";
  return "text-red-400";
}

interface MapsSectionProps {
  maps: MapAggregate[];
}

export function MapsSection({ maps }: MapsSectionProps) {
  const sorted = [...maps].sort((a, b) => b.matchCount - a.matchCount);

  return (
    <div className="bg-surface border border-border/80 rounded-xl overflow-hidden h-full">
      <div className="px-6 pt-5 pb-3 border-b border-border/50">
        <h3 className="text-sm font-semibold text-text-primary">Cartes</h3>
      </div>
      <div className="p-5">
        {sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((map) => (
              <div
                key={map.mapName}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-hover/30 border border-border/50 transition-colors hover:border-border-hover"
              >
                <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{map.mapName}</p>
                  <p className="text-xs text-text-muted/60">{map.matchCount} matchs</p>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-bold ${winRateColor(map.winRate)}`}>{map.winRate.toFixed(0)}%</p>
                  <p className="text-xs text-text-muted/60">KDA {map.averageKda.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <svg className="w-10 h-10 mx-auto text-text-muted/30 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-sm text-text-muted/60">Aucune donnée disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
}
