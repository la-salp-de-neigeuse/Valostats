"use client";

export function GoalWidget({
  goal,
}: {
  goal: { title: string; progress: number; target: number } | null;
}) {
  if (!goal) return null;
  const pct = goal.target > 0 ? Math.min(Math.round((goal.progress / goal.target) * 100), 100) : 0;
  return (
    <div className="ol-card">
      <div className="ol-label ol-text-secondary">Objectif</div>
      <div className="ol-value-sm ol-text-primary" style={{ marginBottom: 2 }}>{goal.title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: "var(--ol-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "var(--ol-accent)",
              borderRadius: 2,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <span className="ol-label ol-text-secondary">
          {goal.progress}/{goal.target}
        </span>
      </div>
    </div>
  );
}
