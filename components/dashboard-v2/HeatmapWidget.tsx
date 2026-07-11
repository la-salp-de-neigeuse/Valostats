"use client";

import type { HeatmapCell } from "@/services/dashboard/types";

interface HeatmapWidgetProps {
  data: HeatmapCell[];
}

export function HeatmapWidget({ data }: HeatmapWidgetProps) {
  const agentNames = [...new Set(data.map((d) => d.agentName))];
  const mapNames = [...new Set(data.map((d) => d.mapName))];

  if (agentNames.length === 0 || mapNames.length === 0) {
    return (
      <div className="p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Heatmap Agents / Maps</h3>
        <p className="text-sm text-slate-500">Pas assez de données</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Heatmap Agents / Maps</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-slate-400 font-medium pb-2 pr-2">Agent</th>
              {mapNames.map((m) => (
                <th key={m} className="text-slate-400 font-medium pb-2 px-1 text-center">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agentNames.map((agent) => (
              <tr key={agent}>
                <td className="text-white pr-2 py-1">{agent}</td>
                {mapNames.map((mapName) => {
                  const cell = data.find((d) => d.agentName === agent && d.mapName === mapName);
                  const intensity = cell ? Math.min(cell.winRate / 100, 1) : 0;
                  return (
                    <td
                      key={`${agent}-${mapName}`}
                      className="px-1 py-1 text-center rounded"
                      style={{
                        backgroundColor: cell
                          ? `rgba(244, 63, 94, ${intensity * 0.6 + 0.1})`
                          : "transparent",
                        color: cell ? (intensity > 0.5 ? "#fff" : "#94a3b8") : "#334155",
                      }}
                    >
                      {cell ? `${cell.winRate}%` : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
