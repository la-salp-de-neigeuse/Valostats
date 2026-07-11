"use client";

import { useState, useCallback } from "react";
import type { WidgetLayout, V2DashboardData } from "@/services/dashboard/types";
import type { AggregateStats, AgentAggregate, MapAggregate } from "@/services/stats/aggregate-stats-service";
import type { EvolutionBlock, PeriodComparison as EvolutionPeriodComparison, RecentMatchPoint } from "@/services/stats/evolution-stats-service";
import type { AnalysisResult } from "@/services/ai/types";
import { PerformanceStats } from "@/components/dashboard/PerformanceStats";
import { AgentStats } from "@/components/dashboard/AgentStats";
import { MapStats } from "@/components/dashboard/MapStats";
import { AiScoreCard } from "@/components/ai-coach/AiScoreCard";
import { WinRateChart } from "@/components/charts/WinRateChart";
import { KdChart } from "@/components/charts/KdChart";
import { PeriodComparison } from "@/components/charts/PeriodComparison";
import { RecentMatchesChart } from "@/components/charts/RecentMatchesChart";
import { HeatmapWidget } from "./HeatmapWidget";
import { TimelineWidget } from "./TimelineWidget";
import { RecentActivityWidget } from "./RecentActivityWidget";
import { GoalsSummaryWidget } from "./GoalsSummaryWidget";
import { RankEvolutionWidget } from "./RankEvolutionWidget";
import { InsightsWidget } from "./InsightsWidget";
import { VsAverageWidget } from "./VsAverageWidget";
import { PredictionWidget } from "./PredictionWidget";

interface DashboardV2ClientProps {
  initialLayout: WidgetLayout[];
  v2Data: V2DashboardData;
  stats: AggregateStats;
  agents: AgentAggregate[];
  maps: MapAggregate[];
  evolutionBlocks: EvolutionBlock[];
  periodComparison: EvolutionPeriodComparison[];
  recentMatches: RecentMatchPoint[];
  analysis: AnalysisResult | null;
  bestMap: string | null;
  worstMap: string | null;
  premium: boolean;
  hasMatches: boolean;
  predictionSummary: {
    currentRankLabel: string;
    nextRankLabel: string;
    globalProgressionScore: number;
    probability: number;
    estimatedMatches: number;
    slope: number;
    winProbability: number;
  } | null;
}

type WidgetComponent = (props: { widget: WidgetLayout }) => React.ReactNode;

function WidgetWrapper({
  widget,
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragOver,
}: {
  widget: WidgetLayout;
  children: React.ReactNode;
  onDragStart?: (e: React.DragEvent, w: WidgetLayout) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent, w: WidgetLayout) => void;
  isDragOver?: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, widget)}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop?.(e, widget)}
      className={`bg-[#111115] border rounded-2xl overflow-hidden transition-all
        ${isDragOver ? "border-rose-500/50 shadow-lg shadow-rose-500/10" : "border-slate-800"}
        hover:border-slate-700 cursor-grab active:cursor-grabbing`}
      style={{ gridColumn: `span ${widget.width}`, gridRow: `span ${widget.height}` }}
    >
      {children}
    </div>
  );
}

export function DashboardV2Client({
  initialLayout,
  v2Data,
  stats,
  agents,
  maps,
  evolutionBlocks,
  periodComparison,
  recentMatches,
  analysis,
  bestMap,
  worstMap,
  premium,
  hasMatches,
  predictionSummary,
}: DashboardV2ClientProps) {
  const [layout, setLayout] = useState<WidgetLayout[]>(initialLayout);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent, w: WidgetLayout) => {
    e.dataTransfer.setData("text/plain", w.id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, target: WidgetLayout) => {
      e.preventDefault();
      setDragOverId(null);
      const draggedId = e.dataTransfer.getData("text/plain");
      if (draggedId === target.id) return;

      setLayout((prev) => {
        const dragged = prev.find((w) => w.id === draggedId);
        const dropIndex = prev.findIndex((w) => w.id === target.id);
        if (!dragged || dropIndex === -1) return prev;

        const next = prev.filter((w) => w.id !== draggedId);
        next.splice(dropIndex, 0, dragged);
        return next.map((w, i) => ({
          ...w,
          positionX: i % 4,
          positionY: Math.floor(i / 4),
        }));
      });
    },
    [],
  );

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/dashboard/widgets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });
    } catch {
      // silence
    } finally {
      setSaving(false);
    }
  }

  const widgets: WidgetComponent = ({ widget }: { widget: WidgetLayout }) => {
    switch (widget.type) {
      case "PERFORMANCE_EVOLUTION":
        return <PerformanceEvolutionWidget evolutionBlocks={evolutionBlocks} periodComparison={periodComparison} recentMatches={recentMatches} premium={premium} />;
      case "AGENT_MAP_HEATMAP":
        return <HeatmapWidget data={v2Data.heatmap} />;
      case "MATCH_TIMELINE":
        return <TimelineWidget data={v2Data.timeline} />;
      case "RECENT_ACTIVITY":
        return <RecentActivityWidget data={v2Data.activity} />;
      case "GOALS_SUMMARY":
        return <GoalsSummaryWidget data={v2Data.goals} />;
      case "RANK_EVOLUTION":
        return <RankEvolutionWidget data={v2Data.rankEvolution} />;
      case "LATEST_INSIGHTS":
        return <InsightsWidget data={v2Data.insights} />;
      case "VS_AVERAGE":
        return <VsAverageWidget data={v2Data.vsAverage} />;
      case "AI_SCORE":
        return analysis ? (
          <div className="p-5">
            <AiScoreCard score={analysis.score} summary={analysis.summary} />
          </div>
        ) : (
          <div className="p-5">
            <WidgetHeader title="Score IA" />
            <p className="text-sm text-slate-500">Aucune analyse disponible</p>
          </div>
        );
      default:
        return <div className="p-5 text-sm text-slate-500">Widget inconnu</div>;
    }
  };

  if (!hasMatches) {
    return (
      <LegacyDashboardShell
        stats={stats}
        analysis={analysis}
        agents={agents}
        maps={maps}
        bestMap={bestMap}
        worstMap={worstMap}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Aperçu complet de vos performances</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl transition-colors text-sm"
        >
          {saving && (
            <svg aria-hidden="true" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Sauvegarder la disposition
        </button>
      </div>

      <PerformanceStats stats={stats} />

      <div className="grid grid-cols-4 gap-4 auto-rows-min">
        {layout
          .filter((w) => w.visible)
          .map((w) => (
            <WidgetWrapper
              key={w.id}
              widget={w}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={() => setDragOverId(null)}
              onDrop={handleDrop}
              isDragOver={dragOverId === w.id}
            >
              {widgets({ widget: w })}
            </WidgetWrapper>
          ))}
      </div>

      {/* PREDICTION SUMMARY BLOCK */}
      {predictionSummary && (
        <div className="bg-[#111115] border border-slate-800 rounded-2xl overflow-hidden shadow-xl max-w-sm">
          <PredictionWidget data={predictionSummary} />
        </div>
      )}
    </div>
  );
}

function WidgetHeader({ title }: { title: string }) {
  return (
    <div className="px-5 py-3 border-b border-slate-800">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
  );
}

function PerformanceEvolutionWidget({
  evolutionBlocks,
  periodComparison,
  recentMatches,
  premium,
}: {
  evolutionBlocks: EvolutionBlock[];
  periodComparison: EvolutionPeriodComparison[];
  recentMatches: RecentMatchPoint[];
  premium: boolean;
}) {
  return (
    <div className="p-5">
      <WidgetHeader title="Évolution" />
      <div className="space-y-4 mt-4">
        <AgentStats agents={[]} />
        <MapStats maps={[]} bestMap={null} worstMap={null} />
        {premium ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-2">Winrate</p>
              <WinRateChart data={evolutionBlocks} />
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-2">K/D</p>
              <KdChart data={evolutionBlocks} />
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-2">Par période</p>
              <PeriodComparison data={periodComparison} />
            </div>
            <div className="bg-slate-800/30 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-2">Derniers matchs</p>
              <RecentMatchesChart data={recentMatches} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Passer Premium pour les graphiques d&apos;évolution</p>
        )}
      </div>
    </div>
  );
}

function LegacyDashboardShell({
  stats,
  analysis,
  agents,
  maps,
  bestMap,
  worstMap,
}: {
  stats: AggregateStats;
  analysis: AnalysisResult | null;
  agents: AgentAggregate[];
  maps: MapAggregate[];
  bestMap: string | null;
  worstMap: string | null;
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-2">Aperçu de vos performances Valorant.</p>
      </div>
      <PerformanceStats stats={stats} />
      {analysis && <AiScoreCard score={analysis.score} summary={analysis.summary} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentStats agents={agents} />
        <MapStats maps={maps} bestMap={bestMap} worstMap={worstMap} />
      </div>
    </div>
  );
}
