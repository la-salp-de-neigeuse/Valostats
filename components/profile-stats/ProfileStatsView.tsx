"use client";

import type { PlayerInfo } from "@/services/dashboard/player-info-service";
import type { AggregateStats, AgentAggregate, MapAggregate } from "@/services/stats/aggregate-stats-service";
import { PlayerInfoSection } from "./PlayerInfoSection";
import { GlobalStatsSection } from "./GlobalStatsSection";
import { AgentsSection } from "./AgentsSection";
import { MapsSection } from "./MapsSection";

interface ProfileStatsViewProps {
  playerInfo: PlayerInfo | null;
  stats: AggregateStats;
  agents: AgentAggregate[];
  maps: MapAggregate[];
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

export function ProfileStatsView({
  playerInfo, stats, agents, maps,
}: ProfileStatsViewProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AnimatedSection delay={0}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d0d14] via-[#111118] to-[#0a0a0e] border border-border/80 p-7 sm:p-9">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/[0.04] rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">Profil Joueur</h1>
            <p className="text-sm text-text-muted/80 mt-1.5">Statistiques et performances Valorant.</p>
          </div>
        </div>
      </AnimatedSection>

      {playerInfo && (
        <AnimatedSection delay={80}>
          <PlayerInfoSection data={playerInfo} />
        </AnimatedSection>
      )}

      <AnimatedSection delay={120}>
        <GlobalStatsSection stats={stats} />
      </AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatedSection delay={160}>
          <AgentsSection agents={agents} />
        </AnimatedSection>
        <AnimatedSection delay={200}>
          <MapsSection maps={maps} />
        </AnimatedSection>
      </div>
    </div>
  );
}
