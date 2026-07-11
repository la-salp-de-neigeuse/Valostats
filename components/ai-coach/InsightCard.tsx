import { CategoryIcon } from "@/components/ai-coach/CategoryIcon";
import { InsightCategory, InsightSeverity } from "@/services/ai/types";
import { getSeverityConfig } from "@/constants/ai";

interface InsightCardProps {
  category: InsightCategory;
  severity: InsightSeverity;
  problem: string;
  explanation: string;
  solution: string;
  compact?: boolean;
}

function getCategoryLabel(category: InsightCategory): string {
  switch (category) {
    case InsightCategory.AIM:
      return "Visée";
    case InsightCategory.GAME_SENSE:
      return "Game Sense";
    case InsightCategory.POSITIONING:
      return "Positionnement";
    case InsightCategory.AGENT_MASTERY:
      return "Maîtrise Agent";
    case InsightCategory.MAP_KNOWLEDGE:
      return "Connaissance Map";
    case InsightCategory.TEAMWORK:
      return "Travail d'équipe";
    case InsightCategory.ECONOMY:
      return "Économie";
    case InsightCategory.CONSISTENCY:
      return "Constance";
  }
}

export function InsightCard({ category, severity, problem, explanation, solution, compact = false }: InsightCardProps) {
  const severityConfig = getSeverityConfig(severity);
  const severityColor = severityConfig.borderBg;
  const severityLabel = severityConfig.label;
  const categoryLabel = getCategoryLabel(category);

  if (compact) {
    return (
      <div className={`bg-[#111115] border rounded-lg p-3 hover:border-slate-700 transition-colors ${severityColor}`}>
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-slate-800/50 rounded-lg shrink-0">
            <CategoryIcon category={category} className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-medium uppercase tracking-wide opacity-75">{categoryLabel}</span>
              <span className="text-[10px] opacity-50">•</span>
              <span className="text-[10px] font-medium uppercase tracking-wide">{severityLabel}</span>
            </div>
            <h4 className="font-semibold text-white text-sm">{problem}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{explanation}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#111115] border rounded-xl p-5 hover:border-slate-700 transition-colors ${severityColor}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-slate-800/50 rounded-lg">
          <CategoryIcon category={category} className="text-slate-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium uppercase tracking-wide opacity-75">{categoryLabel}</span>
            <span className="text-xs font-medium uppercase tracking-wide opacity-75">•</span>
            <span className="text-xs font-medium uppercase tracking-wide">{severityLabel}</span>
          </div>
          <h3 className="font-semibold text-white">{problem}</h3>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-slate-400 mb-1">Explication</p>
          <p className="text-slate-300">{explanation}</p>
        </div>
        <div>
          <p className="text-slate-400 mb-1">Solution</p>
          <p className="text-emerald-400">{solution}</p>
        </div>
      </div>
    </div>
  );
}
