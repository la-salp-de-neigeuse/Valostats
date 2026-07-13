"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AgentPerformanceItem } from "@/services/performance/types";

interface AgentPerformanceChartProps {
  agents: AgentPerformanceItem[];
}

export function AgentPerformanceChart({ agents }: AgentPerformanceChartProps) {
  if (agents.length === 0) {
    return (
      <div className="bg-surface border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Performance par Agent</h3>
        <p className="text-sm text-slate-500">Aucune donnée agent disponible</p>
      </div>
    );
  }

  const chartData = agents
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 6)
    .map((a) => ({
      agent: a.agentDisplayName,
      Winrate: a.winRate,
      Matchs: a.matchCount,
    }));

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Performance par Agent</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="agent" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: "#27272a", opacity: 0.4 }}
            contentStyle={{ background: "#1c1c1f", border: "1px solid #27272a", borderRadius: 8 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${Number(value).toFixed(1)}%`, "Winrate"]}
          />
          <Bar dataKey="Winrate" fill="#FF4655" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
