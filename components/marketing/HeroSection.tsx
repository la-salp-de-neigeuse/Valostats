import Link from "next/link";

function DashboardGlow() {
  return (
    <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function ChartLine() {
  return (
    <svg className="w-full h-12" viewBox="0 0 200 48" fill="none">
      <path
        d="M0 40 Q25 35 50 25 T100 15 T150 20 T200 8"
        stroke="#f43f5e"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M0 40 Q25 35 50 25 T100 15 T150 20 T200 8"
        stroke="url(#heroGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <defs>
        <linearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0" />
          <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FeaturePill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
      {text}
    </span>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <DashboardGlow />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
              <FeaturePill text="Analyse IA" />
              <FeaturePill text="Statistiques temps réel" />
              <FeaturePill text="Leaderboard" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Analysez votre jeu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
                Valorant
              </span>{" "}
              avec l&apos;IA
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              ValoStats transforme vos données de matchs en insights actionnables. 
              Améliorez votre gameplay, suivez votre progression et dominez la ranked.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-rose-500/25"
              >
                Commencer gratuitement
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-medium px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
              >
                En savoir plus
              </Link>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Gratuit
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Sans engagement
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Compte Riot requis
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-rose-500/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-rose-500 rounded-full" />
                  <span className="text-sm font-semibold text-white">Tableau de bord</span>
                </div>
                <span className="text-xs text-slate-500">Dernière synchro : aujourd&apos;hui</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <StatBox label="Winrate" value="58.3%" />
                <StatBox label="K/D" value="1.42" />
                <StatBox label="Matchs" value="127" />
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4 mb-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Évolution K/D</span>
                  <span className="text-xs text-emerald-400">+12%</span>
                </div>
                <ChartLine />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 border-2 border-[#0a0a0c] flex items-center justify-center text-white font-bold text-[10px]">
                      J{i}
                    </div>
                  ))}
                </div>
                <span>+ 3 joueurs suivent leur progression</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-[#111115] to-[#0a0a0c] border border-slate-800 rounded-xl p-3 shadow-xl hidden lg:block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-white">Score IA</p>
                  <p className="text-lg font-bold text-emerald-400">72</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
