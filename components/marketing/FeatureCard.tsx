interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors group">
      <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 w-fit mb-4 group-hover:bg-rose-500/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
