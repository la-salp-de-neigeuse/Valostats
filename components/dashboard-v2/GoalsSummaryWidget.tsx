"use client";

import type { GoalsSummary } from "@/services/dashboard/types";

interface GoalsSummaryWidgetProps {
  data: GoalsSummary;
}

export function GoalsSummaryWidget({ data }: GoalsSummaryWidgetProps) {
  return (
    <div className="p-5 flex flex-col justify-between h-full">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Objectifs</h3>
      <div className="flex items-center gap-6">
        <div className="relative flex items-center justify-center">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="none" style={{ stroke: "var(--border)" }} strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" style={{ stroke: "var(--accent)" }} strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(data.completionRate / 100) * 97.39} 97.39`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-extrabold text-text-primary tabular-nums">{data.completionRate}</span>
            <span className="text-[9px] text-text-muted font-medium uppercase tracking-wider">%</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Actifs</span>
            <span className="text-text-primary font-semibold tabular-nums">{data.activeCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Complétés</span>
            <span className="text-emerald-400 font-semibold tabular-nums">{data.completedCount}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        <p className="text-xs text-text-muted">
          Prochain palier : <span className="text-text-secondary font-medium">{data.nextMilestone}</span>
        </p>
      </div>
    </div>
  );
}
