import type { AgentAggregate } from "@/services/stats/aggregate-stats-service";

interface AgentsSectionProps {
  agents: AgentAggregate[];
}

export function AgentsSection({ agents }: AgentsSectionProps) {
  if (agents.length === 0) {
    return (
      <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Agents principaux</h2>
        <p className="text-slate-400">Aucune donnée disponible.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Agents principaux</h2>
      <div className="space-y-3">
        {agents.slice(0, 5).map((agent) => (
          <div
            key={agent.agentName}
            className="flex items-center gap-4 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500/20 to-orange-400/20 flex items-center justify-center text-rose-400 font-bold">
              {agent.agentDisplayName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{agent.agentDisplayName}</div>
              <div className="text-xs text-slate-400">{agent.matchCount} matchs</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${agent.winRate >= 50 ? "text-emerald-400" : "text-rose-400"}`}>
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
