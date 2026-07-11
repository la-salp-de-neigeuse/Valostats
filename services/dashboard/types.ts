import type { DashboardWidgetType } from "@prisma/client";

export interface WidgetLayout {
  id: string;
  type: DashboardWidgetType;
  title: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  visible: boolean;
}

export interface HeatmapCell {
  agentName: string;
  mapName: string;
  matchCount: number;
  winRate: number;
}

export interface TimelineEntry {
  id: string;
  result: "WIN" | "LOSS" | "DRAW";
  agentName: string;
  mapName: string;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  playedAt: Date;
}

export interface ActivityEntry {
  id: string;
  type: "sync" | "analysis" | "goal" | "badge" | "rank";
  title: string;
  description: string;
  timestamp: Date;
}

export interface GoalsSummary {
  activeCount: number;
  completedCount: number;
  completionRate: number;
  nextMilestone: string;
}

export interface RankPoint {
  rank: string;
  tier: number;
  timestamp: Date;
}

export interface VsAverage {
  label: string;
  playerValue: number;
  averageValue: number;
  unit: string;
  higherIsBetter: boolean;
}

export interface V2DashboardData {
  heatmap: HeatmapCell[];
  timeline: TimelineEntry[];
  activity: ActivityEntry[];
  goals: GoalsSummary;
  rankEvolution: RankPoint[];
  insights: {
    score: number;
    summary: string;
    count: number;
  } | null;
  vsAverage: VsAverage[];
}
