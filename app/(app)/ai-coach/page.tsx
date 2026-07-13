import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AiScoreCard } from "@/components/ai-coach/AiScoreCard";
import { InsightList } from "@/components/ai-coach/InsightList";
import { GoalCard } from "@/components/ai-coach/GoalCard";
import { getCurrentUser } from "@/lib/auth/session";
import { getLatestAnalysis } from "@/services/ai/ai-analysis-service";
import { getLatestCoachingReport } from "@/services/ai/ai-analysis-service";
import { checkAiAnalysisQuota } from "@/services/quotas/quota-service";
import type { Insight } from "@/services/ai/types";
import { InsightCategory, InsightSeverity } from "@/services/ai/types";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "AI Coach",
  description: "Analyse détaillée de vos performances Valorant par intelligence artificielle.",
};

function BrainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

function playStyleLabel(style: string): string {
  switch (style) {
    case "aggressive": return "Agressif";
    case "supportive": return "Support";
    case "inconsistent": return "Irrégulier";
    default: return "Équilibré";
  }
}

function sideLabel(side: string): string {
  switch (side) {
    case "attack": return "Attaque";
    case "defense": return "Défense";
    default: return "Équilibré";
  }
}

export default async function AiCoachPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [analysis, quota, coachingReport] = await Promise.all([
    getLatestAnalysis(user.id),
    checkAiAnalysisQuota(user.id),
    getLatestCoachingReport(user.id),
  ]);

  const insights: Insight[] = analysis
    ? analysis.insights.map((i) => ({
        ...i,
        category: i.category as InsightCategory,
        severity: i.severity as InsightSeverity,
      }))
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <PageHeader icon={<BrainIcon />} title="AI Coach" description="Analyse détaillée de vos performances Valorant" />

      {!analysis && (
        <Card className="p-12 text-center">
          <div className="p-3 bg-surface-hover/50 rounded-xl inline-flex mb-4 text-text-muted">
            <BrainIcon />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Aucune analyse disponible</h2>
          <p className="text-text-muted max-w-md mx-auto leading-relaxed">
            {"Synchronisez vos matchs et jouez au moins 5 parties pour que l'IA puisse générer une analyse personnalisée de vos performances."}
          </p>
        </Card>
      )}

      {analysis && coachingReport && (
        <>
          <AiScoreCard
            score={analysis.score}
            summary={analysis.summary}
            breakdown={coachingReport.scoreBreakdown}
          />

          {quota.limit > 0 && (
            <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-text-muted">
                Analyses IA ce mois-ci : <span className="text-text-primary font-medium">{quota.used}</span> / {quota.limit}
              </span>
              <Link
                href="/api/stripe/checkout"
                className="text-sm text-accent hover:text-accent-hover font-medium transition-colors"
              >
                Passer à Premium pour illimité
              </Link>
            </div>
          )}

          <div className="text-sm text-text-muted text-right">
            Dernière analyse : {formatDate(analysis.createdAt)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text-primary">Profil joueur</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Style</span>
                  <span className="text-text-secondary font-medium">{playStyleLabel(coachingReport.profile.playStyle)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Côté préféré</span>
                  <span className="text-text-secondary font-medium">{sideLabel(coachingReport.profile.preferredSide)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Régularité</span>
                  <span className={`font-medium ${
                    coachingReport.profile.consistency === "stable" ? "text-emerald-400" :
                    coachingReport.profile.consistency === "volatile" ? "text-accent" : "text-amber-400"
                  }`}>
                    {coachingReport.profile.consistency === "stable" ? "Stable" :
                     coachingReport.profile.consistency === "volatile" ? "Irrégulier" : "En progression"}
                  </span>
                </div>
                {coachingReport.profile.mainStrengths.length > 0 && coachingReport.profile.mainStrengths[0] !== "Aucun point fort majeur identifié" && (
                  <div>
                    <span className="text-text-muted block mb-1">Forces</span>
                    <div className="flex flex-wrap gap-1.5">
                      {coachingReport.profile.mainStrengths.map((s, i) => (
                        <span key={i} className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {coachingReport.profile.priorityFocus.length > 0 && coachingReport.profile.priorityFocus[0] !== "Continuer à progresser" && (
                  <div>
                    <span className="text-text-muted block mb-1">Priorités</span>
                    <div className="flex flex-wrap gap-1.5">
                      {coachingReport.profile.priorityFocus.map((p, i) => (
                        <span key={i} className="text-xs bg-accent-light text-accent px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-accent-light rounded-lg text-accent">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-text-primary">Objectifs recommandés</h3>
                </div>
                {coachingReport.goals.length > 0 ? (
                  <div className="space-y-3">
                    {coachingReport.goals.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted italic">Aucun objectif spécifique pour le moment.</p>
                )}
              </Card>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary mb-6">Rapport détaillé</h2>
            <InsightList insights={insights} strengths={coachingReport.strengths} weaknesses={coachingReport.weaknesses} />
          </div>
        </>
      )}
    </div>
  );
}

