import type { ProfileVisibility, UserRole } from "@prisma/client";
import type { AggregateStats, AgentAggregate, MapAggregate, StatsPeriod } from "@/services/stats/aggregate-stats-service";
import type { RecentMatchPoint } from "@/services/stats/evolution-stats-service";

export interface PublicProfile {
  user: {
    id: string;
    name: string | null;
    publicSlug: string;
    visibility: ProfileVisibility;
    role: UserRole;
    riotAccount: {
      gameName: string | null;
      tagLine: string | null;
      currentRank: string | null;
      currentRankTier: number | null;
      platform: string | null;
      regionGroup: string | null;
    } | null;
  };
  stats: AggregateStats;
  agents: AgentAggregate[];
  maps: MapAggregate[];
  recentMatches: RecentMatchPoint[];
  aiAnalysis: {
    score: number | null;
    summary: string | null;
    insights: Array<{
      category: string;
      severity: number;
      problem: string;
      solution: string;
    }> | null;
  } | null;
  period: StatsPeriod;
}

export interface PublicProfileError {
  code: "NOT_FOUND" | "PRIVATE" | "DELETED";
  message: string;
}
