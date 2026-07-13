interface AiSectionProps {
  analysis: {
    score: number | null;
    summary: string | null;
    insights: Array<{
      category: string;
      severity: number;
      problem: string;
      solution: string;
    }> | null;
  };
}

export function AiSection({ analysis }: AiSectionProps) {
  if (!analysis.score && !analysis.summary) {
    return null;
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-slate-400";
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-accent";
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return "bg-accent/20 text-accent border-accent/25";
    if (severity >= 2) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  };

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Analyse IA</h2>

      {/* Score */}
      {analysis.score !== null && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-accent-light to-ai-purple/10 border border-accent/20">
          <div className="text-sm text-slate-400 mb-1">Score IA</div>
          <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score.toFixed(1)}/100
          </div>
        </div>
      )}

      {/* Summary */}
      {analysis.summary && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Résumé coaching</h3>
          <p className="text-slate-300">{analysis.summary}</p>
        </div>
      )}

      {/* Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Points forts & faibles</h3>
          <div className="space-y-3">
            {analysis.insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="font-medium text-sm uppercase tracking-wide">
                    {insight.category}
                  </div>
                </div>
                <div className="mt-2 text-sm text-white font-medium">
                  {insight.problem}
                </div>
                {insight.solution && (
                  <div className="mt-1 text-sm text-slate-300">
                    💡 {insight.solution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
