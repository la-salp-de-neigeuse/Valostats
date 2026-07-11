import { prisma } from "@/lib/prisma/client";
import type { DashboardWidgetType } from "@prisma/client";
import type { WidgetLayout } from "./types";

const DEFAULT_LAYOUTS: Array<Omit<WidgetLayout, "id">> = [
  { type: "PERFORMANCE_EVOLUTION" as DashboardWidgetType, title: "Performance", positionX: 0, positionY: 0, width: 2, height: 1, visible: true },
  { type: "AGENT_MAP_HEATMAP" as DashboardWidgetType, title: "Heatmap Agents/Maps", positionX: 0, positionY: 1, width: 2, height: 1, visible: true },
  { type: "MATCH_TIMELINE" as DashboardWidgetType, title: "Timeline", positionX: 2, positionY: 0, width: 1, height: 2, visible: true },
  { type: "AI_SCORE" as DashboardWidgetType, title: "Score IA", positionX: 3, positionY: 0, width: 1, height: 1, visible: true },
  { type: "LATEST_INSIGHTS" as DashboardWidgetType, title: "Derniers Insights", positionX: 3, positionY: 1, width: 1, height: 1, visible: true },
  { type: "GOALS_SUMMARY" as DashboardWidgetType, title: "Objectifs", positionX: 0, positionY: 2, width: 1, height: 1, visible: true },
  { type: "RECENT_ACTIVITY" as DashboardWidgetType, title: "Activité récente", positionX: 1, positionY: 2, width: 1, height: 1, visible: true },
  { type: "RANK_EVOLUTION" as DashboardWidgetType, title: "Évolution du rang", positionX: 2, positionY: 2, width: 1, height: 1, visible: true },
  { type: "VS_AVERAGE" as DashboardWidgetType, title: "vs Moyenne", positionX: 3, positionY: 2, width: 1, height: 1, visible: true },
];

export async function getWidgetLayout(userId: string): Promise<WidgetLayout[]> {
  const stored = await prisma.dashboardWidget.findMany({
    where: { userId },
    orderBy: [{ positionY: "asc" }, { positionX: "asc" }],
  });

  if (stored.length === 0) {
    return DEFAULT_LAYOUTS.map((d, i) => ({
      id: `default-${i}`,
      ...d,
    }));
  }

  const merged = DEFAULT_LAYOUTS.map((d) => {
    const existing = stored.find((s) => s.type === d.type);
    if (existing) {
      return {
        id: existing.id,
        type: existing.type as DashboardWidgetType,
        title: existing.title,
        positionX: existing.positionX,
        positionY: existing.positionY,
        width: existing.width,
        height: existing.height,
        visible: existing.visible,
      };
    }
    return {
      id: `default-${d.type}`,
      ...d,
    };
  });

  return merged;
}

export async function saveWidgetLayout(
  userId: string,
  layouts: WidgetLayout[],
): Promise<void> {
  for (const w of layouts) {
    await prisma.dashboardWidget.upsert({
      where: { userId_type: { userId, type: w.type } },
      create: {
        userId,
        type: w.type,
        title: w.title,
        positionX: w.positionX,
        positionY: w.positionY,
        width: w.width,
        height: w.height,
        visible: w.visible,
      },
      update: {
        positionX: w.positionX,
        positionY: w.positionY,
        width: w.width,
        height: w.height,
        visible: w.visible,
      },
    });
  }
}
