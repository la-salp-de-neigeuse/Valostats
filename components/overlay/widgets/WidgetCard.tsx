"use client";

export function WidgetCard({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={`ol-card ${className ?? ""}`}>
      <div className="ol-label ol-text-secondary">{label}</div>
      <div className={`ol-value ${accent ? "ol-text-accent" : "ol-text-primary"}`}>{value}</div>
    </div>
  );
}

export function WidgetCardDouble({
  label,
  value,
  sublabel,
  subvalue,
  className,
}: {
  label: string;
  value: string;
  sublabel: string;
  subvalue: string;
  className?: string;
}) {
  return (
    <div className={`ol-card ${className ?? ""}`}>
      <div className="ol-label ol-text-secondary">{label}</div>
      <div className="ol-value ol-text-primary">{value}</div>
      <div style={{ marginTop: 2, display: "flex", gap: 4, alignItems: "baseline" }}>
        <span className="ol-label ol-text-secondary">{sublabel}</span>
        <span className="ol-value-sm ol-text-secondary">{subvalue}</span>
      </div>
    </div>
  );
}
