"use client";

export function LastResultWidget({ lastResult }: { lastResult: string | null }) {
  if (!lastResult) return null;
  const win = lastResult === "WIN";
  return (
    <div className="ol-card">
      <div className="ol-label ol-text-secondary">Dernier</div>
      <div className={`ol-value ${win ? "ol-text-accent" : "ol-text-loss"}`}>
        {win ? "Victoire" : "Défaite"}
      </div>
    </div>
  );
}
