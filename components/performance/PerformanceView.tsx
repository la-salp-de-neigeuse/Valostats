"use client";

import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PerformanceData } from "@/services/performance/types";
import type { EvolutionBlock, PeriodComparison, RecentMatchPoint } from "@/services/stats/evolution-stats-service";
import { MetricCard } from "./widgets/MetricCard";
import { AgentPerformanceChart } from "./widgets/AgentPerformanceChart";
import { MapPerformanceChart } from "./widgets/MapPerformanceChart";
import { EvolutionTimeline } from "./widgets/EvolutionTimeline";
import { AiInsightsPanel } from "./widgets/AiInsightsPanel";

interface PerformanceViewProps {
  data: PerformanceData;
  evolutionBlocks: EvolutionBlock[];
  periodComparison: PeriodComparison[];
  recentMatches: RecentMatchPoint[];
  premium: boolean;
}

export function PerformanceView({
  data,
  evolutionBlocks,
  periodComparison,
  recentMatches,
  premium,
}: PerformanceViewProps) {
  const [period, setPeriod] = useState<string>("all");

  const metrics = data.current;
  const hasData = data.hasData;
  const metricCards = hasData
    ? [
        { label: "Winrate", value: `${metrics.winRate.toFixed(1)}%`, sub: `${metrics.wins}V / ${metrics.losses}D`, color: "text-emerald-500" as const, tooltip: "Pourcentage de parties gagnées" },
        { label: "K/D", value: metrics.kda.toFixed(2), sub: `${metrics.matchCount} matchs`, color: "text-rose-500" as const, tooltip: "Ratio kills / morts" },
        { label: "ADR", value: metrics.damagePerRound.toFixed(1), sub: "par round", color: "text-sky-500" as const, tooltip: "Dégâts moyens par round" },
        { label: "HS %", value: `${metrics.headshotRate.toFixed(1)}%`, sub: "précision", color: "text-amber-500" as const, tooltip: "Taux de têtes" },
        { label: "ACS", value: metrics.combatScore.toFixed(0), sub: "score combat", color: "text-purple-500" as const, tooltip: "Score de combat moyen" },
        { label: "Survie", value: `${(metrics.survivalRate * 100).toFixed(1)}%`, sub: "par round", color: "text-cyan-500" as const, tooltip: "Taux de survie par round" },
        { label: "Attaque", value: `${metrics.attackWinRate.toFixed(1)}%`, sub: "winrate", color: "text-indigo-500" as const, tooltip: "Winrate en attaque" },
        { label: "Défense", value: `${metrics.defenseWinRate.toFixed(1)}%`, sub: "winrate", color: "text-teal-500" as const, tooltip: "Winrate en défense" },
        { label: "Duels ouverts", value: `${metrics.openingDuelSuccess.toFixed(1)}%`, sub: "réussite", color: "text-orange-500" as const, tooltip: "Pourcentage de duels d'ouverture gagnés" },
        { label: "First blood", value: metrics.firstBloodsPerMatch.toFixed(2), sub: "par match", color: "text-lime-500" as const, tooltip: "First bloods par match" },
        { label: "Utilitaire", value: metrics.utilityPerRound.toFixed(2), sub: "par round", color: "text-violet-500" as const, tooltip: "Casts d'utilitaire par round" },
        { label: "Spike plant", value: metrics.plantsPerMatch.toFixed(2), sub: "par match", color: "text-pink-500" as const, tooltip: "Plants de spike par match" },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Performances</h1>
        <p className="text-slate-400 mt-1">Analyse complète de vos statistiques Valorant</p>
      </div>

      {!hasData && (
        <div className="bg-[#111115] border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400">Aucune donnée de performance disponible. Synchronisez vos matchs pour voir vos statistiques.</p>
        </div>
      )}

      {hasData && (
        <>
          <div className="flex flex-wrap gap-2">
            {["all", "30d", "7d"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-rose-500 text-white"
                    : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                {p === "all" ? "Global" : p === "30d" ? "30 jours" : "7 jours"}
              </button>
            ))}
          </div>

          <AiInsightsPanel insights={data.aiInsights} />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {metricCards.map((m) => (
              <MetricCard key={m.label} {...m} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-[#111115] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Profil global</h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={data.radar} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Vous"
                    dataKey="value"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{ background: "#1c1c1f", border: "1px solid #27272a", borderRadius: 8 }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, ""]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-3 space-y-4">
              <AgentPerformanceChart agents={data.agents} />
              <MapPerformanceChart maps={data.maps} />
            </div>
          </div>

          {premium && (
            <EvolutionTimeline
              evolutionBlocks={evolutionBlocks}
              periodComparison={periodComparison}
              recentMatches={recentMatches}
            />
          )}

          {!premium && (
            <div className="bg-[#111115] border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400">
                Passez à Premium pour voir les graphiques d&apos;évolution, la comparaison par période et les matchs récents.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
