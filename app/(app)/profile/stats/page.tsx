import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getPlayerInfo } from "@/services/dashboard/player-info-service";
import {
  getAggregateStatsByPeriod,
  getAgentAggregatesByPeriod,
  getMapAggregatesByPeriod,
  type StatsPeriod,
} from "@/services/stats/aggregate-stats-service";
import { ProfileStatsView } from "@/components/profile-stats/ProfileStatsView";

export const metadata: Metadata = {
  title: "Profil",
  description: "Vos statistiques Valorant complètes : performances, agents, cartes et progression.",
};

export default async function ProfileStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { period: rawPeriod } = await searchParams;
  const period: StatsPeriod = (rawPeriod as StatsPeriod) || "all";

  const [playerInfo, stats, agents, maps] = await Promise.all([
    getPlayerInfo(user.id),
    getAggregateStatsByPeriod(user.id, period),
    getAgentAggregatesByPeriod(user.id, period),
    getMapAggregatesByPeriod(user.id, period),
  ]);

  return (
    <ProfileStatsView
      playerInfo={playerInfo}
      stats={stats}
      agents={agents}
      maps={maps}
    />
  );
}
