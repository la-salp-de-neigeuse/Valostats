"use client";

export function ProgressWidget({ progress }: { progress: number }) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  return (
    <div className="ol-card">
      <div className="ol-label ol-text-secondary">Progression</div>
      <div className="ol-value-sm ol-text-primary" style={{ marginBottom: 4 }}>{progress.toFixed(2)}</div>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: "var(--ol-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: "100%",
            background: "var(--ol-primary)",
            borderRadius: 3,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
