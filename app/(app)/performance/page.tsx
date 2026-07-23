import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getPerformanceData } from "@/services/performance/performance-service";
import { getEvolutionData, getPerformanceByPeriod, getRecentMatchesForChart } from "@/services/stats/evolution-stats-service";
import { isPremiumUser } from "@/services/subscription/subscription-service";
import { PerformanceView } from "@/components/performance/PerformanceView";

export const metadata: Metadata = {
  title: "Performances",
  description: "Analyse complète de vos performances Valorant : winrate, KDA, attaque, défense, duels ouverts et plus.",
};

export default async function PerformancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const premium = await isPremiumUser(user.id);
  const [data, evolutionBlocks, periodComparison, recentMatches] = await Promise.all([
    getPerformanceData(user.id),
    getEvolutionData(user.id, premium),
    getPerformanceByPeriod(user.id, premium),
    getRecentMatchesForChart(user.id, 15),
  ]);

  return (
    <PerformanceView
      data={data}
      evolutionBlocks={evolutionBlocks}
      periodComparison={periodComparison}
      recentMatches={recentMatches}
      premium={premium}
    />
  );
}
