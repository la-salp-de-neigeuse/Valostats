"use client";

import type { GoalWithProgress } from "@/services/goals/types";

const difficultyColors: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  HARD: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const priorityColors: Record<string, string> = {
  LOW: "text-slate-500",
  MEDIUM: "text-slate-400",
  HIGH: "text-amber-400",
  CRITICAL: "text-rose-400",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-slate-800 text-slate-400",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  EXPIRED: "bg-slate-800/50 text-slate-500",
};

function getDeadlineLabel(deadline: Date | null): string {
  if (!deadline) return "";
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Expiré";
  if (days === 1) return "Demain";
  if (days <= 7) return `Dans ${days} jours`;
  return deadline.toLocaleDateString("fr-FR");
}

function getDifficultyLabel(d: string): string {
  if (d === "EASY") return "Facile";
  if (d === "MEDIUM") return "Moyen";
  return "Difficile";
}

function getPriorityLabel(p: string): string {
  if (p === "LOW") return "Basse";
  if (p === "MEDIUM") return "Moyenne";
  if (p === "HIGH") return "Haute";
  return "Critique";
}

function getTypeLabel(t: string): string {
  if (t === "DAILY") return "Journalier";
  if (t === "WEEKLY") return "Hebdomadaire";
  return "Mensuel";
}

export function GoalCard({
  goal,
  compact,
}: {
  goal: GoalWithProgress;
  compact?: boolean;
}) {
  const barColor = goal.percentage >= 70
    ? "bg-emerald-500"
    : goal.percentage >= 40
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${difficultyColors[goal.difficulty] ?? ""}`}>
              {getDifficultyLabel(goal.difficulty)}
            </span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              {getTypeLabel(goal.type)}
            </span>
          </div>
          <h3 className="text-base font-semibold text-white truncate">{goal.title}</h3>
          {!compact && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{goal.description}</p>
          )}
        </div>
        <span className={`text-xs font-medium shrink-0 ${priorityColors[goal.priority] ?? ""}`}>
          {getPriorityLabel(goal.priority)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">
            {goal.currentValue}{goal.unit ? ` ${goal.unit}` : ""} / {goal.targetValue}{goal.unit ? ` ${goal.unit}` : ""}
          </span>
          <span className="font-bold text-white">{goal.percentage}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${goal.percentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
        {goal.deadline && (
          <span className={`text-xs ${getDeadlineLabel(goal.deadline) === "Expiré" ? "text-rose-400" : "text-slate-500"}`}>
            {getDeadlineLabel(goal.deadline)}
          </span>
        )}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${statusColors[goal.status] ?? ""}`}>
          {goal.status === "PENDING" ? "En attente" : goal.status === "IN_PROGRESS" ? "En cours" : goal.status === "COMPLETED" ? "Complété" : "Expiré"}
        </span>
      </div>
    </div>
  );
}
