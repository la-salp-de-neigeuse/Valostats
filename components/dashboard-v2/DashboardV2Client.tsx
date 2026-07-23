"use client";

import { useState, useCallback } from "react";
import type { WidgetLayout, V2DashboardData } from "@/services/dashboard/types";
import type { AggregateStats, AgentAggregate, MapAggregate } from "@/services/stats/aggregate-stats-service";
import type { EvolutionBlock, PeriodComparison as EvolutionPeriodComparison, RecentMatchPoint } from "@/services/stats/evolution-stats-service";
import type { AnalysisResult } from "@/services/ai/types";
import type { PlayerInfo } from "@/services/dashboard/player-info-service";
import { PerformanceStats } from "@/components/dashboard/PerformanceStats";
import { AgentStats } from "@/components/dashboard/AgentStats";
import { MapStats } from "@/components/dashboard/MapStats";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { PlayerInfoCard } from "@/components/dashboard/PlayerInfoCard";
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
import { Button } from "@/components/ui/button";

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
  playerInfo: PlayerInfo | null;
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

function AnimatedSection({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={`animate-stagger-fade ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function WidgetWrapper({
  widget, children, onDragStart, onDragOver, onDragEnd, onDrop, isDragOver, index,
}: {
  widget: WidgetLayout;
  children: React.ReactNode;
  onDragStart?: (e: React.DragEvent, w: WidgetLayout) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDrop?: (e: React.DragEvent, w: WidgetLayout) => void;
  isDragOver?: boolean;
  index: number;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart?.(e, widget)}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop?.(e, widget)}
      className={`animate-stagger-fade bg-surface border rounded-xl overflow-hidden transition-all duration-300
        ${isDragOver ? "border-accent/50 shadow-glow ring-1 ring-accent/20 scale-[1.02]" : "border-border/80"}
        hover:border-border-hover hover:shadow-sm cursor-grab active:cursor-grabbing`}
      style={{
        animationDelay: `${400 + index * 80}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function DashboardV2Client({
  initialLayout, v2Data, stats, agents, maps, evolutionBlocks,
  periodComparison, recentMatches, analysis, bestMap, worstMap,
  premium, hasMatches, playerInfo, predictionSummary,
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

  function WidgetContent({ widget }: { widget: WidgetLayout }) {
    switch (widget.type) {
      case "PERFORMANCE_EVOLUTION":
        return (
          <div className="p-5">
            <WidgetHeader title="Évolution des performances" />
            <div className="space-y-4 mt-4">
              {premium ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-surface-hover/30 rounded-xl p-4 border border-border/50">
                    <p className="text-xs text-text-muted font-medium mb-3">Winrate</p>
                    <WinRateChart data={evolutionBlocks} />
                  </div>
                  <div className="bg-surface-hover/30 rounded-xl p-4 border border-border/50">
                    <p className="text-xs text-text-muted font-medium mb-3">K/D</p>
                    <KdChart data={evolutionBlocks} />
                  </div>
                  <div className="bg-surface-hover/30 rounded-xl p-4 border border-border/50">
                    <p className="text-xs text-text-muted font-medium mb-3">Par période</p>
                    <PeriodComparison data={periodComparison} />
                  </div>
                  <div className="bg-surface-hover/30 rounded-xl p-4 border border-border/50">
                    <p className="text-xs text-text-muted font-medium mb-3">Derniers matchs</p>
                    <RecentMatchesChart data={recentMatches} />
                  </div>
                </div>
              ) : (
                <div className="bg-surface-hover/30 rounded-xl p-6 text-center border border-border/50">
                  <p className="text-sm text-text-muted italic">{"Passez Premium pour les graphiques d'évolution"}</p>
                </div>
              )}
            </div>
          </div>
        );
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
          <div className="p-6 text-center">
            <p className="text-sm text-text-muted/60">Aucune analyse disponible</p>
          </div>
        );
      default:
        return <div className="p-6 text-center"><p className="text-sm text-text-muted/60">Widget inconnu</p></div>;
    }
  }

  if (!hasMatches) {
    return <LegacyDashboardShell stats={stats} analysis={analysis} agents={agents} maps={maps} bestMap={bestMap} worstMap={worstMap} playerInfo={playerInfo} />;
  }

  const sortedLayout = layout.filter((w) => w.visible);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AnimatedSection delay={0}>
        <DashboardHero title="Dashboard" description="Aperçu complet de vos performances Valorant.">
          {sortedLayout.length > 0 && (
            <Button
              onClick={handleSave}
              isLoading={saving}
              variant="secondary"
              size="sm"
              leftIcon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              }
            >
              Sauvegarder
            </Button>
          )}
        </DashboardHero>
      </AnimatedSection>

      {playerInfo && (
        <AnimatedSection delay={80}>
          <PlayerInfoCard data={playerInfo} />
        </AnimatedSection>
      )}

      <AnimatedSection delay={100}>
        <PerformanceStats stats={stats} />
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatedSection delay={200}>
          <AgentStats agents={agents} />
        </AnimatedSection>
        <AnimatedSection delay={250}>
          <MapStats maps={maps} bestMap={bestMap} worstMap={worstMap} />
        </AnimatedSection>
      </div>

      {sortedLayout.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-min">
          {sortedLayout.map((w, i) => (
            <WidgetWrapper
              key={w.id}
              widget={w}
              index={i}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={() => setDragOverId(null)}
              onDrop={handleDrop}
              isDragOver={dragOverId === w.id}
            >
              <WidgetContent widget={w} />
            </WidgetWrapper>
          ))}
        </div>
      )}

      {predictionSummary && (
        <AnimatedSection delay={500} className="bg-surface border border-border/80 rounded-xl overflow-hidden">
          <div className="max-w-md">
            <PredictionWidget data={predictionSummary} />
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}

function WidgetHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border/50">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
    </div>
  );
}

function LegacyDashboardShell({
  stats, analysis, agents, maps, bestMap, worstMap, playerInfo,
}: {
  stats: AggregateStats;
  analysis: AnalysisResult | null;
  agents: AgentAggregate[];
  maps: MapAggregate[];
  bestMap: string | null;
  worstMap: string | null;
  playerInfo: PlayerInfo | null;
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <AnimatedSection delay={0}>
        <DashboardHero title="Dashboard" description="Aperçu de vos performances Valorant." />
      </AnimatedSection>

      {playerInfo && (
        <AnimatedSection delay={80}>
          <PlayerInfoCard data={playerInfo} />
        </AnimatedSection>
      )}

      <AnimatedSection delay={100}>
        <PerformanceStats stats={stats} />
      </AnimatedSection>

      {analysis && (
        <AnimatedSection delay={150}>
          <div className="bg-surface border border-border/80 rounded-xl overflow-hidden">
            <AiScoreCard score={analysis.score} summary={analysis.summary} />
          </div>
        </AnimatedSection>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatedSection delay={200}>
          <AgentStats agents={agents} />
        </AnimatedSection>
        <AnimatedSection delay={250}>
          <MapStats maps={maps} bestMap={bestMap} worstMap={worstMap} />
        </AnimatedSection>
      </div>
    </div>
  );
}
