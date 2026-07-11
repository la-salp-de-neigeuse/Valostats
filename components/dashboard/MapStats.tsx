import type { MapAggregate } from "@/services/stats/aggregate-stats-service";

interface MapStatsProps {
  maps: MapAggregate[];
  bestMap: string | null;
  worstMap: string | null;
}

function MapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

export function MapStats({ maps, bestMap, worstMap }: MapStatsProps) {
  const hasData = maps.length > 0;

  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400">
          <MapIcon />
        </div>
        <h2 className="text-xl font-bold text-white">Maps</h2>
      </div>

      {!hasData ? (
        <p className="text-slate-500 text-sm">Aucune donnée de map disponible</p>
      ) : (
        <div className="space-y-4">
          {bestMap && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-xs text-emerald-400 font-medium mb-1">Meilleure map</p>
              <p className="font-semibold text-white">{bestMap}</p>
            </div>
          )}

          {worstMap && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-xs text-rose-400 font-medium mb-1">Map à améliorer</p>
              <p className="font-semibold text-white">{worstMap}</p>
            </div>
          )}

          <div className="space-y-3 mt-4">
            {maps.slice(0, 5).map((map) => (
              <div
                key={map.mapName}
                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white">{map.mapName}</p>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                      {map.matchCount} match{map.matchCount > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span>WR: <span className="text-white font-medium">{map.winRate.toFixed(1)}%</span></span>
                    <span>Attaque: <span className="text-white font-medium">{map.attackWinRate.toFixed(1)}%</span></span>
                    <span>Défense: <span className="text-white font-medium">{map.defenseWinRate.toFixed(1)}%</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
