"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import type { MapPerformanceItem } from "@/services/performance/types";

interface MapPerformanceChartProps {
  maps: MapPerformanceItem[];
}

export function MapPerformanceChart({ maps }: MapPerformanceChartProps) {
  if (maps.length === 0) {
    return (
      <div className="bg-surface border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Performance par Map</h3>
        <p className="text-sm text-slate-500">Aucune donnée map disponible</p>
      </div>
    );
  }

  const chartData = maps
    .sort((a, b) => b.matchCount - a.matchCount)
    .slice(0, 6)
    .map((m) => ({
      map: m.mapName,
      Attaque: m.attackWinRate,
      Défense: m.defenseWinRate,
    }));

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Performance par Map</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="map" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: "#27272a", opacity: 0.4 }}
            contentStyle={{ background: "#1c1c1f", border: "1px solid #27272a", borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Attaque" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={20} />
          <Bar dataKey="Défense" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
