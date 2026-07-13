import type { MapAggregate } from "@/services/stats/aggregate-stats-service";

interface MapStatsProps {
  maps: MapAggregate[];
  bestMap: string | null;
  worstMap: string | null;
}

function getBarColor(winRate: number): string {
  if (winRate >= 60) return "bg-emerald-500";
  if (winRate >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function getWinrateBadge(winRate: number): string {
  if (winRate >= 60) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (winRate >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-red-400 bg-red-500/10 border-red-500/20";
}

export function MapStats({ maps, bestMap, worstMap }: MapStatsProps) {
  const hasData = maps.length > 0;

  return (
    <div className="bg-surface border border-border/80 rounded-xl overflow-hidden transition-all duration-300 hover:border-border-hover">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border/50">
        <div className="p-2 bg-gradient-to-br from-accent/15 to-accent/5 rounded-xl text-accent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-text-primary">Maps</h2>
          <p className="text-xs text-text-muted/70">Win rate par carte</p>
        </div>
      </div>

      {!hasData ? (
        <div className="p-8 text-center">
          <p className="text-sm text-text-muted/60">Aucune donnée de map disponible</p>
        </div>
      ) : (
        <div className="p-4 space-y-1">
          {bestMap && worstMap && (
            <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-border/40">
              <div className="px-3 py-2.5 bg-emerald-500/[0.06] border border-emerald-500/15 rounded-xl">
                <p className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-wider mb-0.5">Meilleure</p>
                <p className="font-semibold text-text-primary text-sm">{bestMap}</p>
              </div>
              <div className="px-3 py-2.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
                <p className="text-[10px] text-red-400/80 font-bold uppercase tracking-wider mb-0.5">À améliorer</p>
                <p className="font-semibold text-text-primary text-sm">{worstMap}</p>
              </div>
            </div>
          )}

          {maps.slice(0, 6).map((map) => {
            const barColor = getBarColor(map.winRate);
            const badge = getWinrateBadge(map.winRate);
            return (
              <div
                key={map.mapName}
                className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/[0.03] transition-all cursor-default"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-text-primary truncate">{map.mapName}</p>
                    <span className="text-[10px] text-text-muted/50 bg-surface-hover/50 px-1.5 py-0.5 rounded font-medium">{map.matchCount}m</span>
                  </div>
                  <div className="relative h-1.5 bg-surface-hover/50 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barColor} opacity-80 group-hover:opacity-100`}
                      style={{ width: `${map.winRate}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs shrink-0">
                  <span className={`px-2 py-0.5 rounded-md border font-semibold tabular-nums ${badge}`}>
                    {map.winRate.toFixed(0)}%
                  </span>
                  <span className="text-text-muted/50 hidden sm:inline">
                    ATK <span className="text-text-primary font-semibold tabular-nums">{map.attackWinRate.toFixed(0)}%</span>
                  </span>
                  <span className="text-text-muted/50 hidden lg:inline">
                    DEF <span className="text-text-primary font-semibold tabular-nums">{map.defenseWinRate.toFixed(0)}%</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
