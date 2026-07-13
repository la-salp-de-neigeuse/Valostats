import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: ReactNode;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  color?: "accent" | "emerald" | "amber" | "blue" | "rose";
}

const COLOR_ACCENT = {
  accent: {
    border: "border-l-accent/60",
    bg: "bg-accent/[0.03]",
    text: "text-accent",
    iconBg: "bg-accent/10",
    iconText: "text-accent",
    glow: "shadow-[inset_0_1px_0_0_rgba(255,70,85,0.06)]",
  },
  emerald: {
    border: "border-l-emerald-500/60",
    bg: "bg-emerald-500/[0.03]",
    text: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-400",
    glow: "shadow-[inset_0_1px_0_0_rgba(34,197,94,0.06)]",
  },
  amber: {
    border: "border-l-amber-500/60",
    bg: "bg-amber-500/[0.03]",
    text: "text-amber-400",
    iconBg: "bg-amber-500/10",
    iconText: "text-amber-400",
    glow: "shadow-[inset_0_1px_0_0_rgba(245,158,11,0.06)]",
  },
  blue: {
    border: "border-l-blue-500/60",
    bg: "bg-blue-500/[0.03]",
    text: "text-blue-400",
    iconBg: "bg-blue-500/10",
    iconText: "text-blue-400",
    glow: "shadow-[inset_0_1px_0_0_rgba(59,130,246,0.06)]",
  },
  rose: {
    border: "border-l-rose-500/60",
    bg: "bg-rose-500/[0.03]",
    text: "text-rose-400",
    iconBg: "bg-rose-500/10",
    iconText: "text-rose-400",
    glow: "shadow-[inset_0_1px_0_0_rgba(244,63,94,0.06)]",
  },
};

export function StatCard({ title, value, subtitle, icon, trend, color = "accent" }: StatCardProps) {
  const c = COLOR_ACCENT[color];

  return (
    <div
      className={`group relative bg-surface border border-border/80 border-l-[3px] rounded-xl p-5 transition-all duration-300
        ${c.border} ${c.bg} ${c.glow}
        hover:border-l-[3px] hover:border-l-accent hover:bg-accent/[0.04] hover:shadow-[inset_0_1px_0_0_rgba(255,70,85,0.08)]
      `}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted/70">{title}</h3>
        {icon && (
          <div className={`p-2 rounded-lg transition-all duration-300 ${c.iconBg} ${c.iconText} group-hover:bg-accent/10 group-hover:text-accent`}>
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-2xl font-extrabold tracking-tight tabular-nums transition-colors duration-300 ${c.text} group-hover:text-accent`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-text-muted/70 mt-1.5 truncate">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition-all shrink-0
            ${trend.positive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
            <span aria-hidden="true" className="text-sm">{trend.positive ? "▲" : "▼"}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
