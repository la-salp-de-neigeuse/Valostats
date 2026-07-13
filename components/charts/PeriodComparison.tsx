"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { PeriodComparison } from "@/services/stats/evolution-stats-service";

interface PeriodComparisonProps {
  data: PeriodComparison[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1e] border border-slate-700 rounded-lg px-3 py-2 shadow-xl space-y-1">
      {payload.map((entry, i) => (
        <p key={i} className="text-sm text-white">
          {entry.name}: <span className="font-medium">{typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function PeriodComparison({ data }: PeriodComparisonProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        Données insuffisantes pour la comparaison
      </div>
    );
  }

  const chartData = data.map((p) => ({
    label: p.label,
    "Winrate": p.winRate,
    "K/D": p.kdRatio,
    "Matchs": p.matchCount,
    aiScore: p.aiScore ?? 0,
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Winrate" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="K/D" fill="#FF4655" radius={[4, 4, 0, 0]} maxBarSize={24} />
          <Bar dataKey="Matchs" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
