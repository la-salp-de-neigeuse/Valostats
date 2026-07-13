import type { Metadata } from "next";
import type { LeaderboardSortKey, RiotRegionGroup } from "@prisma/client";
import { redirect } from "next/navigation";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { getCurrentUser } from "@/lib/auth/session";
import { getLeaderboard, type LeaderboardPeriod } from "@/services/leaderboard/leaderboard-service";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Classement",
  description: "Comparez vos statistiques aux meilleurs joueurs Valorant et suivez le classement.",
};

function TrophyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7c0 3.31 2.69 6 6 6s6-2.69 6-6V2Z" />
    </svg>
  );
}

const VALID_SORT_VALUES = ["KDA", "WIN_RATE", "AI_SCORE", "PROGRESSION", "MATCH_COUNT"];
const VALID_PERIOD_VALUES = ["7d", "30d", "all"];
const VALID_REGION_VALUES = ["AMERICAS", "ASIA", "EUROPE", "SEA"];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { period?: string; sort?: string; region?: string; rank?: string; page?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const period = (VALID_PERIOD_VALUES.includes(searchParams.period ?? "") ? searchParams.period : "all") as LeaderboardPeriod;
  const sortBy = (VALID_SORT_VALUES.includes(searchParams.sort ?? "") ? searchParams.sort : "KDA") as LeaderboardSortKey;
  const region = VALID_REGION_VALUES.includes(searchParams.region ?? "") ? (searchParams.region as RiotRegionGroup) : undefined;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const rankFilter = searchParams.rank;
  const RANK_MAP: Record<string, { tierMin: number; tierMax: number }> = {
    iron: { tierMin: 0, tierMax: 2 }, bronze: { tierMin: 3, tierMax: 5 },
    silver: { tierMin: 6, tierMax: 8 }, gold: { tierMin: 9, tierMax: 11 },
    platinum: { tierMin: 12, tierMax: 14 }, diamond: { tierMin: 15, tierMax: 17 },
    ascendant: { tierMin: 18, tierMax: 20 }, immortal: { tierMin: 21, tierMax: 23 },
    radiant: { tierMin: 24, tierMax: 24 },
  };

  const rankTierRange = rankFilter ? RANK_MAP[rankFilter] : undefined;

  const data = await getLeaderboard({ period, sortBy, region, rankTierMin: rankTierRange?.tierMin, rankTierMax: rankTierRange?.tierMax, page });

  const qsParams = new URLSearchParams();
  if (period !== "all") qsParams.set("period", period);
  if (sortBy !== "KDA") qsParams.set("sort", sortBy);
  if (region) qsParams.set("region", region);
  if (rankFilter) qsParams.set("rank", rankFilter);
  const currentQueryString = qsParams.toString();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <PageHeader
        icon={<TrophyIcon />}
        title="Classement"
        description="Comparez vos performances aux autres joueurs"
      />

      <LeaderboardFilters />
      <LeaderboardTable data={data} currentSort={sortBy} currentQueryString={currentQueryString} />
    </div>
  );
}
