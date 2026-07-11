"use client";

interface InsightsWidgetProps {
  data: {
    score: number;
    summary: string;
    count: number;
  } | null;
}

export function InsightsWidget({ data }: InsightsWidgetProps) {
  if (!data) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Derniers Insights</h3>
        <p className="text-sm text-slate-500">Aucune analyse disponible</p>
      </div>
    );
  }

  const grade = data.score >= 80 ? "Excellent" : data.score >= 60 ? "Bon" : data.score >= 40 ? "Moyen" : "À améliorer";
  const gradeColor = data.score >= 80 ? "text-emerald-500" : data.score >= 60 ? "text-sky-500" : data.score >= 40 ? "text-amber-500" : "text-red-500";

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Derniers Insights</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg aria-hidden="true" className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${(data.score / 100) * 97.39} 97.39`}
                className={gradeColor}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
              {data.score}
            </span>
          </div>
          <div>
            <p className={`text-sm font-semibold ${gradeColor}`}>{grade}</p>
            <p className="text-xs text-slate-500">{data.count} analyses</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{data.summary}</p>
      </div>
    </div>
  );
}
