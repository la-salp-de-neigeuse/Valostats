import type { RecentMatchPoint } from "@/services/stats/evolution-stats-service";

interface PerformanceSectionProps {
  recentMatches: RecentMatchPoint[];
}

export function PerformanceSection({ recentMatches }: PerformanceSectionProps) {
  if (recentMatches.length === 0) {
    return (
      <div className="bg-surface border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Derniers matchs</h2>
        <p className="text-slate-400">Aucun match récent.</p>
      </div>
    );
  }

  // Calculate win streak
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  for (let i = recentMatches.length - 1; i >= 0; i--) {
    if (recentMatches[i].result === "WIN") {
      tempStreak++;
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak (from most recent)
  for (let i = recentMatches.length - 1; i >= 0; i--) {
    if (recentMatches[i].result === "WIN") {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Derniers matchs</h2>
        <div className="flex gap-4 text-sm">
          <div className="text-slate-400">
            Série actuelle: <span className="text-emerald-400 font-semibold">{currentStreak}W</span>
          </div>
          <div className="text-slate-400">
            Meilleure série: <span className="text-accent font-semibold">{maxStreak}W</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {recentMatches.map((match) => (
          <div
            key={match.id}
            className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                match.result === "WIN"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : match.result === "LOSS"
                  ? "bg-accent/20 text-accent"
                  : "bg-slate-500/20 text-slate-400"
              }`}
            >
              {match.result === "WIN" ? "W" : match.result === "LOSS" ? "L" : "D"}
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-300">{match.agentName}</div>
              <div className="text-xs text-slate-500">{match.mapName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white font-medium">
                {match.kills}/{match.deaths}/{match.assists}
              </div>
              <div className="text-xs text-slate-400">K/D: {match.kdRatio.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
