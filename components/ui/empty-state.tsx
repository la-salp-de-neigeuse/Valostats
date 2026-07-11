import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={`bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-3xl p-8 relative overflow-hidden text-center ${compact ? "max-w-lg mx-auto" : ""}`}>
      {icon && <div className="flex justify-center mb-4 text-slate-600">{icon}</div>}
      <h3 className={`font-bold text-white ${compact ? "text-lg" : "text-xl"}`}>{title}</h3>
      <p className="text-slate-400 mt-2 leading-relaxed max-w-md mx-auto">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex mt-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-rose-500/20"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
