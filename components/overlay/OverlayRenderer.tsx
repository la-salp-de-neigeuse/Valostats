"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { OverlayData, OverlayWidgetType } from "@/services/overlay/types";
import { OverlayThemeProvider } from "./ThemeProvider";
import {
  PlayerNameWidget,
  RankWidget,
  ProgressWidget,
  WinRateWidget,
  KdaWidget,
  AiScoreWidget,
  WinStreakWidget,
  LastResultWidget,
  MainAgentWidget,
  BestAgentWidget,
  LastMatchWidget,
  MatchBarWidget,
  GoalWidget,
  LastInsightWidget,
  SyncTimeWidget,
} from "./widgets";

const WIDGET_MAP: Record<
  OverlayWidgetType,
  (data: OverlayData) => React.ReactNode
> = {
  playerName: (d) => <PlayerNameWidget playerName={d.playerName} />,
  rank: (d) => <RankWidget rank={d.rank} rankTier={d.rankTier} />,
  rr: (d) => <ProgressWidget progress={d.rankProgressValue} />,
  winRate: (d) => <WinRateWidget winRate={d.winRate} />,
  kda: (d) => <KdaWidget kda={d.kda} />,
  aiScore: (d) => <AiScoreWidget score={d.aiScore} />,
  recentMatches: (d) => <MatchBarWidget matches={d.lastMatches} />,
  lastMatch: (d) => <LastMatchWidget match={d.lastMatch} />,
  mainAgent: (d) => <MainAgentWidget mainAgent={d.mainAgent} />,
  bestAgent: (d) => <BestAgentWidget agent={d.bestAgent} />,
  winStreak: (d) => <WinStreakWidget streak={d.winStreak} />,
  lastResult: (d) => <LastResultWidget lastResult={d.lastResult} />,
  progression: (d) => <ProgressWidget progress={d.rankProgressValue} />,
  goalOfDay: (d) => <GoalWidget goal={d.goalOfDay} />,
  lastAiInsight: (d) => <LastInsightWidget insight={d.lastAiInsight} />,
  syncTime: (d) => <SyncTimeWidget syncTimeAgo={d.syncTimeAgo} />,
};

function computeDataHash(d: OverlayData): string {
  const parts = [
    d.playerName,
    d.rank,
    d.winRate.toFixed(2),
    d.kda.toFixed(3),
    d.aiScore,
    d.winStreak,
    d.lastResult,
    d.lastMatch?.result,
    d.lastMatch?.kills,
    d.lastMatch?.deaths,
    d.mainAgent,
    d.goalOfDay?.progress,
    d.syncTimeAgo,
  ];
  return parts.join("|");
}

function gridClass(cols: number): string {
  if (cols <= 2) return "ol-grid-2";
  if (cols <= 3) return "ol-grid-3";
  if (cols <= 4) return "ol-grid-4";
  if (cols <= 6) return "ol-grid-6";
  return "ol-grid-12";
}

export function OverlayRenderer({
  initialData,
  slug,
}: {
  initialData: OverlayData;
  slug: string;
}) {
  const [data, setData] = useState<OverlayData>(initialData);
  const hashRef = useRef(computeDataHash(initialData));
  const intervalMs = data.settings.refreshInterval * 1000;
  const visible = data.settings.widgets.filter((w) => w.visible);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/overlay/${slug}`);
      if (!res.ok) return;
      const fresh = (await res.json()) as OverlayData;
      const newHash = computeDataHash(fresh);
      if (newHash !== hashRef.current) {
        hashRef.current = newHash;
        setData(fresh);
      }
    } catch {
      // silence fetch errors in OBS
    }
  }, [slug]);

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | undefined;

    function startPolling() {
      if (id) clearInterval(id);
      id = setInterval(fetchData, intervalMs);
    }

    function stopPolling() {
      if (id) {
        clearInterval(id);
        id = undefined;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchData();
        startPolling();
      } else {
        stopPolling();
      }
    }

    startPolling();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchData, intervalMs]);

  const columns = 12;

  return (
    <div className={`overlay-root ${data.settings.size}`}>
      <OverlayThemeProvider settings={data.settings} />

      <div
        style={{
          background: "var(--ol-bg)",
          color: "var(--ol-text)",
          minHeight: "100vh",
          padding: data.settings.size === "small" ? 12 : data.settings.size === "large" ? 24 : 16,
          fontFamily: "inherit",
        }}
      >
        <div
          className={gridClass(columns)}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: data.settings.size === "small" ? 6 : data.settings.size === "large" ? 12 : 8,
            alignItems: "start",
          }}
        >
          {visible.map((widget) => {
            const renderFn = WIDGET_MAP[widget.type];
            if (!renderFn) return null;
            const content = renderFn(data);
            if (!content) return null;

            return (
              <div
                key={widget.type}
                style={{
                  gridColumn: `span ${widget.w}`,
                  gridRow: `span ${widget.h}`,
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
