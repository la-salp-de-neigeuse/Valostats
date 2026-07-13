import type { AgentAggregate } from "@/services/stats/aggregate-stats-service";

interface AgentsSectionProps {
  agents: AgentAggregate[];
}

export function AgentsSection({ agents }: AgentsSectionProps) {
  if (agents.length === 0) {
    return (
      <div className="bg-surface border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Agents principaux</h2>
        <p className="text-slate-400">Aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Agents principaux</h2>
      <div className="space-y-3">
        {agents.slice(0, 5).map((agent) => (
          <div
            key={agent.agentName}
            className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50"
          >
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{agent.agentDisplayName}</div>
              <div className="text-xs text-slate-400">{agent.matchCount} matchs</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${agent.winRate >= 50 ? "text-emerald-400" : "text-accent"}`}>
                {agent.winRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">Winrate</div>
            </div>
            <div className="text-right w-16">
              <div className="text-sm font-medium text-white">{agent.averageKda.toFixed(2)}</div>
              <div className="text-xs text-slate-400">K/D</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
