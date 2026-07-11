"use client";

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  color: "text-emerald-500" | "text-rose-500" | "text-sky-500" | "text-amber-500" | "text-purple-500" | "text-cyan-500" | "text-indigo-500" | "text-teal-500" | "text-orange-500" | "text-lime-500" | "text-violet-500" | "text-pink-500";
  tooltip?: string;
}

export function MetricCard({ label, value, sub, color, tooltip }: MetricCardProps) {
  return (
    <div
      className="bg-[#111115] border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors group relative"
      title={tooltip}
    >
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color} tracking-tight`}>{value}</p>
      <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
    </div>
  );
}
