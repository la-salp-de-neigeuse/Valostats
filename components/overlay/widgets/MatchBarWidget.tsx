"use client";

import type { OverlayMatchEntry } from "@/services/overlay/types";

function resultLabel(r: string): string {
  return r === "WIN" ? "V" : "D";
}

export function MatchBarWidget({ matches }: { matches: OverlayMatchEntry[] }) {
  if (matches.length === 0) return null;
  const displayed = matches.slice(0, 10);
  return (
    <div className="ol-card">
      <div className="ol-label ol-text-secondary">Derniers matchs</div>
      <div className="ol-match-row" style={{ flexWrap: "wrap" }}>
        {displayed.map((m, i) => (
          <span
            key={i}
            className={`ol-badge ${m.result === "WIN" ? "ol-badge-win" : "ol-badge-loss"}`}
            title={`${m.mapName} - ${m.agentName} (${m.kills}/${m.deaths}/${m.assists})`}
          >
            {resultLabel(m.result)}
          </span>
        ))}
      </div>
    </div>
  );
}
