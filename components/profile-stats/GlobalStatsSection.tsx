"use client";

import type { AggregateStats } from "@/services/stats/aggregate-stats-service";

interface GlobalStatsSectionProps {
  stats: AggregateStats;
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-surface border border-border/80 rounded-xl p-4 transition-colors hover:border-border-hover">
      <p className={`text-2xl font-bold ${accent ? "text-accent" : "text-text-primary"}`}>{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}

function kda(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return (kills + assists).toFixed(2);
  return ((kills + assists) / deaths).toFixed(2);
}

export function GlobalStatsSection({ stats }: GlobalStatsSectionProps) {
  const hasData = stats.matchCount > 0;

  const items = [
    { label: "Winrate", value: hasData ? `${stats.winRate.toFixed(1)}%` : "—", accent: stats.winRate >= 50 },
    { label: "Victoires", value: String(stats.wins), accent: false },
    { label: "Défaites", value: String(stats.losses), accent: true },
    { label: "KDA", value: hasData ? kda(stats.averageKills, stats.averageDeaths, stats.averageAssists) : "—", accent: false },
    { label: "ACS", value: hasData ? stats.combatScore.toFixed(0) : "—", accent: false },
    { label: "ADR", value: hasData ? stats.damagePerRound.toFixed(0) : "—", accent: false },
    { label: "Headshot %", value: hasData && stats.headshotRateAvailable ? `${stats.headshotRate.toFixed(1)}%` : hasData ? "N/D" : "—", accent: false },
    { label: "KAST", value: "Non disponible", accent: false },
    { label: "Score moyen", value: hasData ? stats.combatScore.toFixed(0) : "—", accent: false },
  ];

  return (
    <div className="bg-surface border border-border/80 rounded-xl overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-border/50">
        <h3 className="text-sm font-semibold text-text-primary">Statistiques globales</h3>
      </div>
      <div className="p-5">
        {hasData ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <StatCard key={item.label} label={item.label} value={item.value} accent={item.accent} />
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <svg className="w-10 h-10 mx-auto text-text-muted/30 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L22 22H2L12 2Z" />
            </svg>
            <p className="text-sm text-text-muted/60">Aucune donnée disponible. Jouez un match pour commencer l&apos;analyse.</p>
          </div>
        )}
      </div>
    </div>
  );
}
