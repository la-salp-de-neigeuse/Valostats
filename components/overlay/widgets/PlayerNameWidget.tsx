"use client";

export function PlayerNameWidget({ playerName }: { playerName: string }) {
  return (
    <div className="ol-header ol-fade-in">
      <div className="ol-title ol-text-primary">{playerName}</div>
    </div>
  );
}
