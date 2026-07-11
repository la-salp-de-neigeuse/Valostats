import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getLatestAnalysis } from "@/services/ai/ai-analysis-service";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Aperçu complet de vos performances Valorant en un coup d'œil.",
};
import { getRiotAccountByUserId } from "@/services/riot-account/riot-account-service";
import { isPremiumUser } from "@/services/subscription/subscription-service";
import {
  getAgentAggregatesByPeriod,
  getAggregateStatsByPeriod,
  getMapAggregatesByPeriod,
  type StatsPeriod,
} from "@/services/stats/aggregate-stats-service";
import {
  getEvolutionData,
  getPerformanceByPeriod,
  getRecentMatchesForChart,
} from "@/services/stats/evolution-stats-service";
import { getV2DashboardData } from "@/services/dashboard/v2-dashboard-service";
import { getWidgetLayout } from "@/services/dashboard/widget-layout-service";
import { getPrediction } from "@/services/prediction/prediction-service";
import { DashboardV2Client } from "@/components/dashboard-v2/DashboardV2Client";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { period: rawPeriod } = await searchParams;
  const period: StatsPeriod = (rawPeriod as StatsPeriod) || "all";

  const premium = await isPremiumUser(user.id);

  const [
    stats,
    agents,
    maps,
    riotAccount,
    analysis,
    evolutionBlocks,
    periodComparison,
    recentMatches,
    v2Data,
    initialLayout,
    prediction,
  ] = await Promise.all([
    getAggregateStatsByPeriod(user.id, period),
    getAgentAggregatesByPeriod(user.id, period),
    getMapAggregatesByPeriod(user.id, period),
    getRiotAccountByUserId(user.id),
    getLatestAnalysis(user.id),
    getEvolutionData(user.id, premium),
    getPerformanceByPeriod(user.id, premium),
    getRecentMatchesForChart(user.id, 15, premium),
    getV2DashboardData(user.id),
    getWidgetLayout(user.id),
    getPrediction(user.id),
  ]);

  const hasMatches = stats.matchCount > 0;
  const hasRiotAccount = riotAccount !== null;
  const isVerified = riotAccount?.isVerified ?? false;

  if (!hasRiotAccount) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bonjour, {user.name || "Utilisateur"}</h1>
          <p className="text-slate-400 mt-2">Voici un aperçu de vos performances Valorant.</p>
        </div>
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
              <path d="M12 2L22 22H2L12 2Z" />
            </svg>
          }
          title="Connectez votre compte Riot Games"
          description="Pour commencer à analyser vos statistiques, liez et vérifiez votre compte Valorant."
          action={{ label: "Lier mon compte Riot", href: "/profile" }}
        />
      </div>
    );
  }

  if (hasRiotAccount && isVerified && !hasMatches) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bonjour, {user.name || "Utilisateur"}</h1>
          <p className="text-slate-400 mt-2">Voici un aperçu de vos performances Valorant.</p>
        </div>
        <EmptyState
          title="Synchronisez vos matchs"
          description="Votre compte Riot est vérifié. Lancez une synchronisation pour alimenter votre dashboard."
          action={{ label: "Synchroniser depuis le profil", href: "/profile" }}
        />
      </div>
    );
  }

  return (
    <DashboardV2Client
      initialLayout={initialLayout}
      v2Data={v2Data}
      stats={stats}
      agents={agents}
      maps={maps}
      evolutionBlocks={evolutionBlocks}
      periodComparison={periodComparison}
      recentMatches={recentMatches}
      analysis={analysis}
      bestMap={stats.bestMap}
      worstMap={stats.worstMap}
      premium={premium}
      hasMatches={hasMatches}
      predictionSummary={prediction ? {
        currentRankLabel: prediction.currentRankLabel,
        nextRankLabel: prediction.nextRankLabel,
        globalProgressionScore: prediction.globalProgressionScore,
        probability: prediction.probability,
        estimatedMatches: prediction.estimatedMatches,
        slope: prediction.slope,
        winProbability: prediction.winProbability,
      } : null}
    />
  );
}
