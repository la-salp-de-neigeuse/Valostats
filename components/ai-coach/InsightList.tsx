import { InsightCard } from "@/components/ai-coach/InsightCard";
import { InsightSeverity } from "@/services/ai/types";
import type { Insight } from "@/services/ai/types";

interface InsightListProps {
  insights: Insight[];
  strengths: Insight[];
  weaknesses: Insight[];
}

export function InsightList({ insights, strengths, weaknesses }: InsightListProps) {
  const criticalInsights = insights.filter((i) => i.severity === InsightSeverity.CRITICAL);
  const highInsights = insights.filter((i) => i.severity === InsightSeverity.HIGH);
  const mediumInsights = insights.filter((i) => i.severity === InsightSeverity.MEDIUM);

  const hasInsights = insights.length > 0;

  if (!hasInsights) {
    return (
      <div className="bg-surface border border-slate-800 rounded-2xl p-8 text-center">
        <p className="text-slate-400">Aucune analyse disponible pour le moment.</p>
        <p className="text-slate-500 text-sm mt-2">Synchronisez vos matchs pour générer une analyse IA.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          Points forts ({strengths.length})
        </h3>
        <div role="list" className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strengths.map((insight) => (
            <div key={`strength-${insight.category}-${insight.problem}`} role="listitem">
              <InsightCard {...insight} compact />
            </div>
          ))}
        </div>
        {strengths.length === 0 && (
          <p className="text-sm text-slate-500 italic">Aucun point fort majeur identifié. Continuez à progresser !</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-accent mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-accent rounded-full" />
          Points à améliorer ({weaknesses.length})
        </h3>

        {criticalInsights.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-accent mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              Critiques ({criticalInsights.length})
            </h4>
            <div role="list" className="space-y-3">
              {criticalInsights.map((insight) => (
                <div key={`critical-${insight.category}-${insight.problem}`} role="listitem">
                  <InsightCard {...insight} />
                </div>
              ))}
            </div>
          </div>
        )}

        {highInsights.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-ai-purple mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-ai-purple rounded-full" />
              Importants ({highInsights.length})
            </h4>
            <div role="list" className="space-y-3">
              {highInsights.map((insight) => (
                <div key={`high-${insight.category}-${insight.problem}`} role="listitem">
                  <InsightCard {...insight} />
                </div>
              ))}
            </div>
          </div>
        )}

        {mediumInsights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              Modérés ({mediumInsights.length})
            </h4>
            <div role="list" className="space-y-3">
              {mediumInsights.map((insight) => (
                <div key={`medium-${insight.category}-${insight.problem}`} role="listitem">
                  <InsightCard {...insight} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
