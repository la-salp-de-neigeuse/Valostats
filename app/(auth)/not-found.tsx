import Link from "next/link";

function NotFoundIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

export default function AuthNotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-gradient-to-br bg-surface border border-border rounded-3xl p-8 text-center">
          <div className="p-4 bg-accent-light rounded-2xl inline-flex mb-6 text-accent">
            <NotFoundIcon />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Page introuvable</h1>
          <p className="text-slate-400 max-w-sm mx-auto leading-relaxed mb-8">
            {"La page que vous recherchez n'existe pas ou a été déplacée."}
          </p>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-accent hover:bg-accent-hover text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-accent-glow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

