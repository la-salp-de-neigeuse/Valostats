import { StatCard } from "@/components/dashboard/StatCard";
import type { AggregateStats } from "@/services/stats/aggregate-stats-service";

interface PerformanceStatsProps {
  stats: AggregateStats;
}

function TargetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function CrosshairIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function PerformanceStats({ stats }: PerformanceStatsProps) {
  const hasData = stats.matchCount > 0;

  return (
    <div className="space-y-6" aria-label="Statistiques de performance">
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Matchs joués"
            value={hasData ? stats.matchCount : "--"}
            subtitle={hasData ? `${stats.wins}V · ${stats.losses}D` : "Aucune donnée"}
            icon={<ActivityIcon />}
          />
          <StatCard
            title="Taux de victoire"
            value={hasData ? `${stats.winRate}%` : "--"}
            subtitle={hasData ? `${stats.draws} match nul${stats.draws > 1 ? "s" : ""}` : "En attente"}
            icon={<TargetIcon />}
          />
          <StatCard
            title="K/D Ratio"
            value={hasData ? stats.kdRatio : "--"}
            subtitle={hasData ? `${stats.averageKills}K / ${stats.averageDeaths}D / ${stats.averageAssists}A` : "Synchronisez vos matchs"}
            icon={<CrosshairIcon />}
          />
        </div>
      </div>

      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Headshot Rate"
            value={`${stats.headshotRate}%`}
            subtitle="Précision"
            icon={<CrosshairIcon />}
          />
          <StatCard
            title="Dégâts/Round"
            value={stats.damagePerRound.toFixed(0)}
            subtitle="Impact"
            icon={<TargetIcon />}
          />
          <StatCard
            title="Attaque Win Rate"
            value={`${stats.attackWinRate}%`}
            subtitle="Côté attaque"
            icon={<ShieldIcon />}
          />
          <StatCard
            title="Défense Win Rate"
            value={`${stats.defenseWinRate}%`}
            subtitle="Côté défense"
            icon={<ShieldIcon />}
          />
        </div>
      )}
    </div>
  );
}
