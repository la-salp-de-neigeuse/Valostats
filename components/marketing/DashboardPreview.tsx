function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function MiniChart({ color }: { color: string }) {
  return (
    <svg className="w-full h-8" viewBox="0 0 120 32" fill="none">
      <path
        d="M0 24 Q15 28 30 18 T60 12 T90 8 T120 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function DashboardPreview() {
  return (
    <section className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium tracking-wider text-rose-400 uppercase mb-4">Aperçu</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Un tableau de bord{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
              clair et puissant
            </span>
          </h2>
          <p className="text-slate-400 mt-4 leading-relaxed">
            Toutes vos statistiques centralisées, accessibles en un clic.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-500/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
                J
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Joueur</p>
                <p className="text-xs text-slate-500">Platine 2 • EUW</p>
              </div>
            </div>
            <div className="flex gap-1">
              {["7j", "30j", "Global"].map((label) => (
                <span
                  key={label}
                  className={`text-xs px-2.5 py-1 rounded-md ${
                    label === "Global"
                      ? "bg-rose-500/20 text-rose-400"
                      : "text-slate-500 hover:text-slate-300 cursor-pointer"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Matchs" value="127" color="text-white" />
            <StatCard label="Winrate" value="58.3%" color="text-emerald-400" />
            <StatCard label="K/D" value="1.42" color="text-rose-400" />
            <StatCard label="Score IA" value="72" color="text-yellow-400" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Évolution Winrate</span>
                <span className="text-xs text-emerald-400">+5%</span>
              </div>
              <MiniChart color="#22c55e" />
            </div>
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Évolution K/D</span>
                <span className="text-xs text-rose-400">+0.15</span>
              </div>
              <MiniChart color="#f43f5e" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-600">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>Kills</span>
            <span className="w-2 h-2 bg-rose-500 rounded-full ml-3" />
            <span>Deaths</span>
          </div>
        </div>
      </div>
    </section>
  );
}
