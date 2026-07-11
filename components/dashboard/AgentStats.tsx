import type { AgentAggregate } from "@/services/stats/aggregate-stats-service";

interface AgentStatsProps {
  agents: AgentAggregate[];
}

function AgentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function AgentStats({ agents }: AgentStatsProps) {
  const hasData = agents.length > 0;

  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400">
          <AgentIcon />
        </div>
        <h2 className="text-xl font-bold text-white">Agents</h2>
      </div>

      {!hasData ? (
        <p className="text-slate-500 text-sm">Aucune donnée d&apos;agent disponible</p>
      ) : (
        <div className="space-y-3">
          {agents.slice(0, 5).map((agent) => (
            <div
              key={agent.agentName}
              className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-white">{agent.agentDisplayName}</p>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                    {agent.matchCount} match{agent.matchCount > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                  <span>WR: <span className="text-white font-medium">{agent.winRate.toFixed(1)}%</span></span>
                  <span>K/D: <span className="text-white font-medium">{agent.averageKda.toFixed(2)}</span></span>
                  <span>ADR: <span className="text-white font-medium">{agent.damagePerRound.toFixed(0)}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
