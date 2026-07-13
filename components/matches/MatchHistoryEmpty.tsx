import Link from "next/link";

export function MatchHistoryEmpty() {
  return (
    <div className="bg-surface border border-slate-800 rounded-3xl p-12 text-center">
      <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto mb-6 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-500"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Aucun match enregistré</h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
        Synchronisez votre compte Riot depuis votre profil pour importer votre historique de matchs.
      </p>
      <Link
        href="/profile"
        className="inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-accent-glow"
      >
        Aller au profil
      </Link>
    </div>
  );
}
