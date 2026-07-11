import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: ReactNode;
  icon?: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        {icon && (
          <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400 group-hover:text-rose-400 transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${
              trend.positive ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10"
            }`}
          >
            <span aria-hidden="true">{trend.positive ? "↑" : "↓"}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
