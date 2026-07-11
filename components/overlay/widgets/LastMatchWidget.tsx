"use client";

import type { OverlayMatchEntry } from "@/services/overlay/types";

export function LastMatchWidget({ match }: { match: OverlayMatchEntry | null }) {
  if (!match) return null;
  const win = match.result === "WIN";
  return (
    <div className="ol-card">
      <div className="ol-label ol-text-secondary">Dernier match</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className={`ol-badge ${win ? "ol-badge-win" : "ol-badge-loss"}`}>
          {win ? "V" : "D"}
        </span>
        <span className="ol-value-sm ol-text-primary">
          {match.kills}/{match.deaths}/{match.assists}
        </span>
        <span className="ol-label ol-text-secondary" style={{ opacity: 0.5 }}>
          {match.agentName} &middot; {match.mapName}
        </span>
      </div>
    </div>
  );
}
