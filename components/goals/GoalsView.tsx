"use client";

import { useState } from "react";
import type { GoalWithProgress, GoalStats, GlobalProgression, Badge } from "@/services/goals/types";
import { GoalCard } from "./GoalCard";
import { StatsOverview } from "./StatsOverview";
import { BadgeGrid } from "./BadgeGrid";

type Tab = "active" | "history" | "stats" | "badges";

export function GoalsView({
  activeGoals,
  completedGoals,
  expiredGoals,
  stats,
  progression,
  badges,
}: {
  activeGoals: GoalWithProgress[];
  completedGoals: GoalWithProgress[];
  expiredGoals: GoalWithProgress[];
  stats: GoalStats;
  progression: GlobalProgression | null;
  badges: Badge[];
}) {
  const [tab, setTab] = useState<Tab>("active");

  const tabs: Array<{ id: Tab; label: string; count?: number }> = [
    { id: "active", label: "En cours", count: activeGoals.length },
    { id: "history", label: "Historique", count: completedGoals.length + expiredGoals.length },
    { id: "stats", label: "Statistiques" },
    { id: "badges", label: "Badges", count: badges.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-surface border border-slate-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.id
                ? "bg-accent text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                tab === t.id ? "bg-white/20" : "bg-slate-800"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "active" && (
        <div className="space-y-4">
          {activeGoals.length === 0 ? (
            <div className="bg-surface border border-slate-800 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">Aucun objectif actif</h3>
              <p className="text-sm text-slate-400">
                Les objectifs sont générés automatiquement après chaque synchronisation et analyse IA.
                Synchronisez vos matchs pour obtenir des recommandations personnalisées.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          {completedGoals.length === 0 && expiredGoals.length === 0 ? (
            <div className="bg-surface border border-slate-800 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">📜</div>
              <p className="text-sm text-slate-400">Aucun objectif complété ou expiré pour le moment.</p>
            </div>
          ) : (
            <>
              {completedGoals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Complétés ({completedGoals.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completedGoals.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} compact />
                    ))}
                  </div>
                </div>
              )}
              {expiredGoals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Expirés ({expiredGoals.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expiredGoals.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} compact />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "stats" && (
        <StatsOverview stats={stats} progression={progression} />
      )}

      {tab === "badges" && <BadgeGrid badges={badges} />}
    </div>
  );
}
