import type { AgentAggregate } from "@/services/stats/aggregate-stats-service";

interface AgentStatsProps {
  agents: AgentAggregate[];
}

function getBarColor(winRate: number): string {
  if (winRate >= 60) return "bg-emerald-500";
  if (winRate >= 50) return "bg-amber-500";
  return "bg-red-500";
}

function getWinrateBadge(winRate: number): string {
  if (winRate >= 60) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (winRate >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-red-400 bg-red-500/10 border-red-500/20";
}

export function AgentStats({ agents }: AgentStatsProps) {
  const hasData = agents.length > 0;

  return (
    <div className="bg-surface border border-border/80 rounded-xl overflow-hidden transition-all duration-300 hover:border-border-hover">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border/50">
        <div className="p-2 bg-gradient-to-br from-accent/15 to-accent/5 rounded-xl text-accent">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-bold text-text-primary">Agents</h2>
          <p className="text-xs text-text-muted/70">Performance par agent</p>
        </div>
      </div>

      {!hasData ? (
        <div className="p-8 text-center">
          <p className="text-sm text-text-muted/60">{"Aucune donnée d'agent disponible"}</p>
        </div>
      ) : (
        <div className="p-4 space-y-1">
          {agents.slice(0, 6).map((agent) => {
            const barColor = getBarColor(agent.winRate);
            const badge = getWinrateBadge(agent.winRate);
            return (
              <div
                key={agent.agentName}
                className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/[0.03] transition-all cursor-default"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-text-primary truncate">{agent.agentDisplayName}</p>
                    <span className="text-[10px] text-text-muted/50 bg-surface-hover/50 px-1.5 py-0.5 rounded font-medium">{agent.matchCount}m</span>
                  </div>
                  <div className="relative h-1.5 bg-surface-hover/50 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barColor} opacity-80 group-hover:opacity-100`}
                      style={{ width: `${agent.winRate}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-xs shrink-0">
                  <span className={`px-2 py-0.5 rounded-md border font-semibold tabular-nums ${badge}`}>
                    {agent.winRate.toFixed(1)}%
                  </span>
                  <span className="text-text-muted/50 hidden sm:inline">
                    K/D <span className="text-text-primary font-semibold tabular-nums">{agent.averageKda.toFixed(2)}</span>
                  </span>
                  <span className="text-text-muted/50 hidden lg:inline">
                    ADR <span className="text-text-primary font-semibold tabular-nums">{agent.damagePerRound.toFixed(0)}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

