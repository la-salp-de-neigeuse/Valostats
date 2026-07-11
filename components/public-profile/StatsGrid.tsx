import type { AggregateStats } from "@/services/stats/aggregate-stats-service";

interface StatsGridProps {
  stats: AggregateStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    { label: "Matchs", value: stats.matchCount, color: "text-white" },
    { label: "Victoires", value: stats.wins, color: "text-emerald-400" },
    { label: "Défaites", value: stats.losses, color: "text-rose-400" },
    { label: "Winrate", value: `${stats.winRate.toFixed(1)}%`, color: "text-white" },
    { label: "K/D", value: stats.kdRatio.toFixed(2), color: "text-white" },
    { label: "KDA", value: ((stats.averageKills + stats.averageAssists) / (stats.averageDeaths || 1)).toFixed(2), color: "text-white" },
    { label: "Headshot %", value: `${stats.headshotRate.toFixed(1)}%`, color: "text-white" },
    { label: "ADR", value: stats.damagePerRound.toFixed(0), color: "text-white" },
    { label: "Combat Score", value: stats.combatScore.toFixed(0), color: "text-white" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item) => (
        <div key={item.label} className="bg-[#111115] border border-slate-800 rounded-xl p-4">
          <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-sm text-slate-400 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
