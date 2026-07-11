"use client";

export function LastInsightWidget({
  insight,
}: {
  insight: { problem: string; solution: string } | null;
}) {
  if (!insight) return null;
  return (
    <div className="ol-card">
      <div className="ol-label ol-text-secondary">Dernier insight IA</div>
      <div className="ol-value-sm ol-text-primary" style={{ marginBottom: 2 }}>{insight.problem}</div>
      <div className="ol-label ol-text-secondary" style={{ opacity: 0.6, lineHeight: 1.3 }}>
        {insight.solution}
      </div>
    </div>
  );
}
