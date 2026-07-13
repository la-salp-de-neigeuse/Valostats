"use client";

interface InsightsWidgetProps {
  data: { score: number; summary: string; count: number } | null;
}

export function InsightsWidget({ data }: InsightsWidgetProps) {
  if (!data) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Derniers Insights</h3>
        <p className="text-sm text-text-muted">Aucune analyse disponible</p>
      </div>
    );
  }

  const grade = data.score >= 80 ? "Excellent" : data.score >= 60 ? "Bon" : data.score >= 40 ? "Moyen" : "À améliorer";
  const gradeColor = data.score >= 80 ? "text-emerald-400" : data.score >= 60 ? "text-sky-400" : data.score >= 40 ? "text-amber-400" : "text-red-400";
  const strokeColor = data.score >= 80 ? "#22c55e" : data.score >= 60 ? "#38bdf8" : data.score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Derniers Insights</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14">
            <svg aria-hidden="true" className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" style={{ stroke: "var(--border)" }} strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke={strokeColor} strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(data.score / 100) * 97.39} 97.39`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-text-primary tabular-nums">{data.score}</span>
          </div>
          <div>
            <p className={`text-sm font-bold ${gradeColor}`}>{grade}</p>
            <p className="text-xs text-text-muted">{data.count} analyses</p>
          </div>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 border-t border-border pt-3">{data.summary}</p>
      </div>
    </div>
  );
}
