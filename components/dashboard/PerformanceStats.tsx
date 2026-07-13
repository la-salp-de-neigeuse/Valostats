import type { AggregateStats } from "@/services/stats/aggregate-stats-service";
import { StatCard } from "@/components/dashboard/StatCard";

interface PerformanceStatsProps {
  stats: AggregateStats;
}

export function PerformanceStats({ stats }: PerformanceStatsProps) {
  const hasData = stats.matchCount > 0;

  return (
    <div className="space-y-5" aria-label="Statistiques de performance">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Matchs"
          value={hasData ? stats.matchCount : "--"}
          subtitle={hasData ? `${stats.wins}V · ${stats.losses}D` : "Aucune donnée"}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Winrate"
          value={hasData ? `${stats.winRate}%` : "--"}
          subtitle={hasData ? `${stats.draws} nul${stats.draws > 1 ? "s" : ""}` : "En attente"}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          }
          color="emerald"
        />
        <StatCard
          title="K/D"
          value={hasData ? stats.kdRatio.toFixed(2) : "--"}
          subtitle={hasData ? `${stats.averageKills}K / ${stats.averageDeaths}D` : "Sync required"}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="2" x2="12" y2="12" /><line x1="12" y1="12" x2="16" y2="16" />
            </svg>
          }
          color="accent"
        />
        <StatCard
          title="ADR"
          value={hasData ? stats.damagePerRound.toFixed(0) : "--"}
          subtitle={hasData ? `${stats.combatScore} ACS` : "En attente"}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          }
          color="amber"
        />
      </div>

      {hasData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Headshot"
            value={`${stats.headshotRate}%`}
            subtitle="Précision"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="5" /><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
              </svg>
            }
            color="rose"
          />
          <StatCard
            title="Attaque"
            value={`${stats.attackWinRate}%`}
            subtitle="Win rate attaque"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            color="emerald"
          />
          <StatCard
            title="Défense"
            value={`${stats.defenseWinRate}%`}
            subtitle="Win rate défense"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            color="blue"
          />
          <StatCard
            title="Utility"
            value={stats.utilityPerRound.toFixed(1)}
            subtitle="Casts / round"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            }
            color="amber"
          />
        </div>
      )}
    </div>
  );
}
