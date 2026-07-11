import type { MapAggregate } from "@/services/stats/aggregate-stats-service";

interface MapsSectionProps {
  maps: MapAggregate[];
}

export function MapsSection({ maps }: MapsSectionProps) {
  if (maps.length === 0) {
    return (
      <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Meilleures maps</h2>
        <p className="text-slate-400">Aucune donnée disponible.</p>
      </div>
    );
  }

  const bestMaps = maps.filter((m) => m.winRate >= 50).slice(0, 3);
  const worstMaps = maps.filter((m) => m.winRate < 50).slice(0, 3);

  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Meilleures maps</h2>
      <div className="space-y-3">
        {bestMaps.length > 0 ? (
          bestMaps.map((map) => (
            <div
              key={map.mapName}
              className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                {map.mapName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{map.mapName}</div>
                <div className="text-xs text-slate-400">{map.matchCount} matchs</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-emerald-400">{map.winRate.toFixed(1)}%</div>
                <div className="text-xs text-slate-400">Winrate</div>
              </div>
              <div className="text-right w-16">
                <div className="text-sm font-medium text-white">{map.averageKda.toFixed(2)}</div>
                <div className="text-xs text-slate-400">K/D</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400 text-sm">Pas assez de données pour les meilleures maps.</p>
        )}
      </div>

      {worstMaps.length > 0 && (
        <>
          <h3 className="text-lg font-semibold text-white mt-6 mb-3">Maps à améliorer</h3>
          <div className="space-y-3">
            {worstMaps.map((map) => (
              <div
                key={map.mapName}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50"
              >
                <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                  {map.mapName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{map.mapName}</div>
                  <div className="text-xs text-slate-400">{map.matchCount} matchs</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-rose-400">{map.winRate.toFixed(1)}%</div>
                  <div className="text-xs text-slate-400">Winrate</div>
                </div>
                <div className="text-right w-16">
                  <div className="text-sm font-medium text-white">{map.averageKda.toFixed(2)}</div>
                  <div className="text-xs text-slate-400">K/D</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
