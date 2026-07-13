"use client";

import type { GoalStats, GlobalProgression } from "@/services/goals/types";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-4">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-2xl font-bold ${accent ? "text-accent" : "text-white"}`}>{value}</div>
    </div>
  );
}

function ProgressRing({ value, label }: { value: number; label: string }) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const color = clamped >= 70 ? "stroke-emerald-500" : clamped >= 40 ? "stroke-amber-500" : "stroke-accent";

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-5 text-center">
      <div className="relative w-20 h-20 mx-auto mb-3">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="#27272a" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            className={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${(clamped / 100) * 188.5} 188.5`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{clamped}%</span>
        </div>
      </div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

export function StatsOverview({
  stats,
  progression,
}: {
  stats: GoalStats;
  progression: GlobalProgression | null;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Complétés" value={stats.totalCompleted} accent />
        <StatCard label="En cours" value={stats.totalActive} />
        <StatCard label="Expirés" value={stats.totalExpired} />
        <StatCard label="Points gagnés" value={stats.pointsEarned} accent />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Série actuelle" value={`${stats.currentStreak}`} />
        <StatCard label="Meilleure série" value={`${stats.bestStreak}`} />
        <StatCard label="Taux complétion" value={`${stats.completionRate}%`} />
        <StatCard label="Taux global" value={progression ? `${progression.overallScore}%` : "—"} accent />
      </div>

      {progression && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProgressRing value={progression.weeklyCompletion} label="Hebdomadaire" />
          <ProgressRing value={progression.monthlyCompletion} label="Mensuel" />
          <ProgressRing value={progression.overallScore} label="Global" />
          <div className="bg-surface border border-slate-800 rounded-2xl p-5 flex flex-col justify-center">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Prochain palier</div>
            <div className="text-lg font-bold text-white">{progression.nextMilestone}</div>
          </div>
        </div>
      )}
    </div>
  );
}
