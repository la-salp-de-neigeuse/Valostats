import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getLatestAnalysis } from "@/services/ai/ai-analysis-service";

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
    getEvolutionData(user.id),
    getPerformanceByPeriod(user.id),
    getRecentMatchesForChart(user.id),
    getV2DashboardData(user.id),
    getWidgetLayout(user.id),
    getPrediction(user.id),
  ]);

  const hasMatches = stats.matchCount > 0;
  const hasRiotAccount = riotAccount !== null;
  const isVerified = riotAccount?.isVerified ?? false;
  const premium = await isPremiumUser(user.id);

  if (!hasRiotAccount) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bonjour, {user.name || "Utilisateur"}</h1>
          <p className="text-slate-400 mt-2">Voici un aperçu de vos performances Valorant.</p>
        </div>
        <div className="mt-12 bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L22 22H2L12 2Z" />
            </svg>
          </div>
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Connectez votre compte Riot Games</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Pour commencer à analyser vos statistiques, liez et vérifiez votre compte Valorant.
            </p>
            <Link
              href="/profile"
              className="inline-flex bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-rose-500/20"
            >
              Lier mon compte Riot
            </Link>
          </div>
        </div>
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
        <div className="mt-12 bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Synchronisez vos matchs</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Votre compte Riot est vérifié. Lancez une synchronisation pour alimenter votre dashboard.
            </p>
            <Link
              href="/profile"
              className="inline-flex bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-rose-500/20"
            >
              Synchroniser depuis le profil
            </Link>
          </div>
        </div>
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
