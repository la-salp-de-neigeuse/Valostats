import type { ScoreBreakdown as ScoreBreakdownType } from "@/services/ai/types";
import { SCORE_BREAKDOWN_MAX, SCORE_BREAKDOWN_LABELS, SCORE_BREAKDOWN_BAR_COLORS } from "@/constants/ai";

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
}

function getMaxValue(key: string): number {
  return SCORE_BREAKDOWN_MAX[key as keyof typeof SCORE_BREAKDOWN_MAX] ?? 25;
}

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const items = [
    { key: "kda", value: breakdown.kda },
    { key: "winRate", value: breakdown.winRate },
    { key: "headshotRate", value: breakdown.headshotRate },
    { key: "damagePerRound", value: breakdown.damagePerRound },
    { key: "firstDeathRate", value: breakdown.firstDeathRate },
    { key: "consistency", value: breakdown.consistency },
    { key: "agentMastery", value: breakdown.agentMastery },
    { key: "mapKnowledge", value: breakdown.mapKnowledge },
  ] as const;

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Détail du score
      </h3>
      <div className="space-y-3">
        {items.map(({ key, value }) => {
          const max = getMaxValue(key);
          const pct = (value / max) * 100;
          const colorClass = SCORE_BREAKDOWN_BAR_COLORS[key as keyof typeof SCORE_BREAKDOWN_BAR_COLORS];

          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{SCORE_BREAKDOWN_LABELS[key]}</span>
                <span className="text-slate-400 font-mono">
                  {value}/{max}
                </span>
              </div>
              <div
                className="h-2 bg-slate-800 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={`${SCORE_BREAKDOWN_LABELS[key]}: ${value}/${max}`}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
