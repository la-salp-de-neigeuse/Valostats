import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AiScoreCard } from "@/components/ai-coach/AiScoreCard";

export const metadata: Metadata = {
  title: "AI Coach",
  description: "Analyse détaillée de vos performances Valorant par intelligence artificielle.",
};
import { InsightList } from "@/components/ai-coach/InsightList";
import { GoalCard } from "@/components/ai-coach/GoalCard";
import { getCurrentUser } from "@/lib/auth/session";
import { getLatestAnalysis } from "@/services/ai/ai-analysis-service";
import { getLatestCoachingReport } from "@/services/ai/ai-analysis-service";
import { checkAiAnalysisQuota } from "@/services/quotas/quota-service";
import type { Insight } from "@/services/ai/types";
import { InsightCategory, InsightSeverity } from "@/services/ai/types";

function BrainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function playStyleLabel(style: string): string {
  switch (style) {
    case "aggressive":
      return "Agressif";
    case "supportive":
      return "Support";
    case "inconsistent":
      return "Irrégulier";
    default:
      return "Équilibré";
  }
}

function sideLabel(side: string): string {
  switch (side) {
    case "attack":
      return "Attaque";
    case "defense":
      return "Défense";
    default:
      return "Équilibré";
  }
}

export default async function AiCoachPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

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
      <div className="flex items-center gap-3">
        <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
          <BrainIcon />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Coach</h1>
          <p className="text-slate-400 mt-1">Analyse détaillée de vos performances Valorant</p>
        </div>
      </div>

      {!analysis && (
        <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-3xl p-8 text-center">
          <div className="p-3 bg-slate-800/50 rounded-xl inline-flex mb-4">
            <BrainIcon />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Aucune analyse disponible</h2>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Synchronisez vos matchs et jouez au moins 5 parties pour que l&apos;IA puisse générer une analyse personnalisée de vos performances.
          </p>
        </div>
      )}

      {analysis && coachingReport && (
        <>
          <AiScoreCard
            score={analysis.score}
            summary={analysis.summary}
            breakdown={coachingReport.scoreBreakdown}
          />

          {quota.limit > 0 && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Analyses IA ce mois-ci : <span className="text-white font-medium">{quota.used}</span> / {quota.limit}
              </span>
              <Link
                href="/api/stripe/checkout"
                className="text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors"
              >
                Passer à Premium pour illimité
              </Link>
            </div>
          )}

          <div className="text-sm text-slate-500 text-right">
            Dernière analyse : {formatDate(analysis.createdAt)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#111115] border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                  <UserIcon />
                </div>
                <h3 className="font-semibold text-white">Profil joueur</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Style</span>
                  <span className="text-slate-200 font-medium">{playStyleLabel(coachingReport.profile.playStyle)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Côté préféré</span>
                  <span className="text-slate-200 font-medium">{sideLabel(coachingReport.profile.preferredSide)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Régularité</span>
                  <span className={`font-medium ${
                    coachingReport.profile.consistency === "stable" ? "text-emerald-400" :
                    coachingReport.profile.consistency === "volatile" ? "text-rose-400" : "text-amber-400"
                  }`}>
                    {coachingReport.profile.consistency === "stable" ? "Stable" :
                     coachingReport.profile.consistency === "volatile" ? "Irrégulier" : "En progression"}
                  </span>
                </div>
                {coachingReport.profile.mainStrengths.length > 0 && coachingReport.profile.mainStrengths[0] !== "Aucun point fort majeur identifié" && (
                  <div>
                    <span className="text-slate-400 block mb-1">Forces</span>
                    <div className="flex flex-wrap gap-1.5">
                      {coachingReport.profile.mainStrengths.map((s, i) => (
                        <span key={i} className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {coachingReport.profile.priorityFocus.length > 0 && coachingReport.profile.priorityFocus[0] !== "Continuer à progresser" && (
                  <div>
                    <span className="text-slate-400 block mb-1">Priorités</span>
                    <div className="flex flex-wrap gap-1.5">
                      {coachingReport.profile.priorityFocus.map((p, i) => (
                        <span key={i} className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-[#111115] border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-400">
                    <TargetIcon />
                  </div>
                  <h3 className="font-semibold text-white">Objectifs recommandés</h3>
                </div>
                {coachingReport.goals.length > 0 ? (
                  <div className="space-y-3">
                    {coachingReport.goals.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">Aucun objectif spécifique pour le moment.</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-6">Rapport détaillé</h2>
            <InsightList
              insights={insights}
              strengths={coachingReport.strengths}
              weaknesses={coachingReport.weaknesses}
            />
          </div>
        </>
      )}
    </div>
  );
}
