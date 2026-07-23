"use client";

import { useState } from "react";
import type { AgentAggregate } from "@/services/stats/aggregate-stats-service";
import { getAgentUuid } from "@/lib/valorant/agents";

const AGENT_ICON_BASE = "https://media.valorant-api.com/agents";

function AgentIcon({ uuid, name }: { uuid: string; name: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center">
        <span className="text-xs font-bold text-text-muted">{name[0]}</span>
      </div>
    );
  }

  return (
    <img
      src={`${AGENT_ICON_BASE}/${uuid}/displayicon.png`}
      alt={name}
      className="w-9 h-9 rounded-lg bg-surface-hover"
      onError={() => setError(true)}
    />
  );
}

function winRateColor(rate: number): string {
  if (rate >= 55) return "text-emerald-400";
  if (rate >= 45) return "text-yellow-400";
  return "text-red-400";
}

interface AgentsSectionProps {
  agents: AgentAggregate[];
}

export function AgentsSection({ agents }: AgentsSectionProps) {
  const sorted = [...agents].sort((a, b) => b.matchCount - a.matchCount);
  const top5 = sorted.slice(0, 5);

  return (
    <div className="bg-surface border border-border/80 rounded-xl overflow-hidden h-full">
      <div className="px-6 pt-5 pb-3 border-b border-border/50">
        <h3 className="text-sm font-semibold text-text-primary">Agents</h3>
      </div>
      <div className="p-5">
        {top5.length > 0 ? (
          <div className="space-y-3">
            {top5.map((agent, i) => {
              const uuid = getAgentUuid(agent.agentDisplayName);
              return (
                <div
                  key={agent.agentName}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-hover/30 border border-border/50 transition-colors hover:border-border-hover"
                >
                  <span className="w-5 text-center text-xs font-bold text-text-muted">{i + 1}</span>

                  {uuid ? (
                    <AgentIcon uuid={uuid} name={agent.agentDisplayName} />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center">
                      <span className="text-xs font-bold text-text-muted">{agent.agentDisplayName[0]}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{agent.agentDisplayName}</p>
                    <p className="text-xs text-text-muted/60">{agent.matchCount} matchs</p>
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-bold ${winRateColor(agent.winRate)}`}>{agent.winRate.toFixed(0)}%</p>
                    <p className="text-xs text-text-muted/60">KDA {agent.averageKda.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <svg className="w-10 h-10 mx-auto text-text-muted/30 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L22 22H2L12 2Z" />
            </svg>
            <p className="text-sm text-text-muted/60">Aucune donnée disponible.</p>
          </div>
        )}
      </div>
    </div>
  );
}
