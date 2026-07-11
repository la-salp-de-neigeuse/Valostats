"use client";

import type { GoalsSummary } from "@/services/dashboard/types";

interface GoalsSummaryWidgetProps {
  data: GoalsSummary;
}

export function GoalsSummaryWidget({ data }: GoalsSummaryWidgetProps) {
  return (
    <div className="p-5 flex flex-col justify-between h-full">
      <h3 className="text-sm font-semibold text-white mb-4">Objectifs</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Actifs</span>
          <span className="text-lg font-bold text-white">{data.activeCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Complétés</span>
          <span className="text-lg font-bold text-emerald-500">{data.completedCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Taux de complétion</span>
          <span className="text-lg font-bold text-white">{data.completionRate}%</span>
        </div>
        <div className="pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Prochain palier : <span className="text-slate-300">{data.nextMilestone}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
