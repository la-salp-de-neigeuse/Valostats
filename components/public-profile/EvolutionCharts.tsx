"use client";

import type { RecentMatchPoint } from "@/services/stats/evolution-stats-service";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface EvolutionChartsProps {
  recentMatches: RecentMatchPoint[];
}

export function EvolutionCharts({ recentMatches }: EvolutionChartsProps) {
  if (recentMatches.length === 0) {
    return (
      <div className="bg-surface border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Évolution</h2>
        <p className="text-slate-400">Pas assez de données pour afficher les graphiques.</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = recentMatches.map((match, index) => ({
    match: index + 1,
    kdRatio: match.kdRatio,
    kills: match.kills,
    deaths: match.deaths,
  }));

  return (
    <div className="bg-surface border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Évolution</h2>

      <div className="space-y-6">
        {/* K/D Evolution */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">K/D par match</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="match" 
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `M${value}`}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, "dataMax + 0.5"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1626",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="kdRatio"
                  stroke="#FF4655"
                  strokeWidth={2}
                  dot={{ fill: "#FF4655", r: 4 }}
                  name="K/D"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kills/Deaths Evolution */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Kills / Deaths par match</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="match" 
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(value) => `M${value}`}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, "dataMax + 5"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F1626",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="kills"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  name="Kills"
                />
                <Line
                  type="monotone"
                  dataKey="deaths"
                  stroke="#FF4655"
                  strokeWidth={2}
                  dot={{ fill: "#FF4655", r: 4 }}
                  name="Deaths"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
