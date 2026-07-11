import type { CoachingGoal } from "@/services/ai/types";
import { getDifficultyConfig } from "@/constants/ai";

interface GoalCardProps {
  goal: CoachingGoal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const diffConfig = getDifficultyConfig(goal.difficulty);
  const diffColor = diffConfig.color;
  const diffLabel = diffConfig.label;

  return (
    <div className="bg-[#111115] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-white text-sm">{goal.title}</h4>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${diffColor}`}>
          {diffLabel}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-3">{goal.description}</p>
      <div className="flex items-center gap-4 text-xs">
        <div>
          <span className="text-slate-500">Actuel : </span>
          <span className="text-slate-300 font-mono" aria-label={`Valeur actuelle : ${goal.currentValue}`}>{goal.currentValue}</span>
        </div>
        <div>
          <span className="text-slate-500">Objectif : </span>
          <span className="text-emerald-400 font-mono" aria-label={`Valeur cible : ${goal.targetValue}`}>{goal.targetValue}</span>
        </div>
        <div className="ml-auto">
          <span className="text-slate-500">{goal.metric}</span>
        </div>
      </div>
    </div>
  );
}
