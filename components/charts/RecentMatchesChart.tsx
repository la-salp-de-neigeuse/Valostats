"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { RecentMatchPoint } from "@/services/stats/evolution-stats-service";

interface RecentMatchesChartProps {
  data: RecentMatchPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1e] border border-slate-700 rounded-lg px-3 py-2 shadow-xl space-y-1">
      <p className="text-xs text-slate-400">Match {label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm text-white">
          {entry.name}: <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function RecentMatchesChart({ data }: RecentMatchesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        Aucun match récent à afficher
      </div>
    );
  }

  const chartData = data.map((m, i) => ({
    label: String(i + 1),
    Kills: m.kills,
    Deaths: m.deaths,
    result: m.result,
    agentName: m.agentName,
    mapName: m.mapName,
    kdRatio: m.kdRatio,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Kills" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={12} />
          <Bar dataKey="Deaths" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
