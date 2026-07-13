import type { ScoreBreakdown as ScoreBreakdownType } from "@/services/ai/types";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { getScoreThreshold } from "@/constants/ai";

interface AiScoreCardProps {
  score: number;
  summary: string;
  breakdown?: ScoreBreakdownType | null;
}

function BrainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

export function AiScoreCard({ score, summary, breakdown }: AiScoreCardProps) {
  const threshold = getScoreThreshold(score);
  const scoreColor = threshold.color;
  const scoreLabel = threshold.label;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-gradient-to-br bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-accent-light rounded-xl text-accent">
            <BrainIcon />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">AI Coach</h2>
            <p className="text-sm text-slate-400">Analyse de performance</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-4">
          <div>
            <p className="text-5xl font-bold text-white tracking-tight" aria-label={`Score AI Coach : ${score.toFixed(0)} sur 100, ${scoreLabel}`}>{score.toFixed(0)}</p>
            <p className={`text-sm font-medium ${scoreColor} mt-1`} aria-hidden="true">{scoreLabel}</p>
          </div>
          <div
            className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(score)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Score AI Coach : ${score.toFixed(0)}%`}
          >
            <div
              className={`h-full rounded-full transition-all ${threshold.bg}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
        </div>
      </div>

      {breakdown && (
        <div className="lg:col-span-1">
          <ScoreBreakdown breakdown={breakdown} />
        </div>
      )}
    </div>
  );
}
