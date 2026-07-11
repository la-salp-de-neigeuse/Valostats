import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-lg font-bold text-white tracking-wider">
              VALO<span className="text-rose-500">STATS</span>
            </span>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Plateforme SaaS d&apos;analyse et d&apos;amélioration pour joueurs de Valorant.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Application</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Dashboard</Link></li>
              <li><Link href="/ai-coach" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">AI Coach</Link></li>
              <li><Link href="/leaderboard" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Classement</Link></li>
              <li><Link href="/matches" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Matchs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Liens</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Connexion</Link></li>
              <li><Link href="/register" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Inscription</Link></li>
              <li><span className="text-sm text-slate-500">Tarifs</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Légal</h4>
            <ul className="space-y-2">
              <li><Link href="/mentions-legales" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Mentions légales</Link></li>
              <li><Link href="/cgu" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">CGU</Link></li>
              <li><Link href="/confidentialite" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Confidentialité</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} ValoStats. Tous droits réservés.
          </p>
          <p className="text-xs text-slate-600">
            Valorant est une marque déposée de Riot Games, Inc. ValoStats n&apos;est pas affilié à Riot Games.
          </p>
        </div>
      </div>
    </footer>
  );
}
