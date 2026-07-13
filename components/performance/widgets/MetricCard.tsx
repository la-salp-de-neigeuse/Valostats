"use client";

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  color: "text-emerald-500" | "text-accent" | "text-sky-500" | "text-amber-500" | "text-purple-500" | "text-cyan-500" | "text-indigo-500" | "text-teal-500" | "text-ai-purple" | "text-lime-500" | "text-violet-500" | "text-pink-500";
  tooltip?: string;
}

export function MetricCard({ label, value, sub, color, tooltip }: MetricCardProps) {
  return (
    <div
      className="bg-surface border border-border/60 rounded-2xl p-4 hover:border-border transition-colors group relative"
      title={tooltip}
    >
      <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
      <p className="text-xs text-text-muted/60 mt-0.5">{sub}</p>
    </div>
  );
}
