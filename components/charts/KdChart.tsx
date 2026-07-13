"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { EvolutionBlock } from "@/services/stats/evolution-stats-service";

interface KdChartProps {
  data: EvolutionBlock[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1e] border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-sm font-medium text-white">{payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export function KdChart({ data }: KdChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        {"Pas assez de matchs pour afficher l'évolution"}
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="kdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF4655" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#FF4655" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            domain={[0, "auto"]}
            tickFormatter={(v: number) => v.toFixed(1)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="kdRatio"
            stroke="#FF4655"
            strokeWidth={2}
            fill="url(#kdGradient)"
            dot={{ fill: "#FF4655", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

