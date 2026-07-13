"use client";

import type { EvolutionBlock, PeriodComparison, RecentMatchPoint } from "@/services/stats/evolution-stats-service";
import { WinRateChart } from "@/components/charts/WinRateChart";
import { KdChart } from "@/components/charts/KdChart";
import { PeriodComparison as PeriodComparisonChart } from "@/components/charts/PeriodComparison";
import { RecentMatchesChart } from "@/components/charts/RecentMatchesChart";

interface EvolutionTimelineProps {
  evolutionBlocks: EvolutionBlock[];
  periodComparison: PeriodComparison[];
  recentMatches: RecentMatchPoint[];
}

export function EvolutionTimeline({
  evolutionBlocks,
  periodComparison,
  recentMatches,
}: EvolutionTimelineProps) {
  if (evolutionBlocks.length === 0 && periodComparison.length === 0 && recentMatches.length === 0) {
    return (
      <div className="bg-surface border border-slate-800 rounded-2xl p-6 text-center">
        <p className="text-slate-500 text-sm">{"Pas assez de données pour afficher l'évolution"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Évolution</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Winrate</h3>
          <WinRateChart data={evolutionBlocks} />
        </div>
        <div className="bg-surface border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">K/D</h3>
          <KdChart data={evolutionBlocks} />
        </div>
        <div className="bg-surface border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Par période</h3>
          <PeriodComparisonChart data={periodComparison} />
        </div>
        <div className="bg-surface border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Derniers matchs</h3>
          <RecentMatchesChart data={recentMatches} />
        </div>
      </div>
    </div>
  );
}

