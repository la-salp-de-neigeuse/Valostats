import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-brand-br flex items-center justify-center text-white font-bold text-xs shadow-glow">
                V
              </div>
              <span className="text-base font-bold tracking-wider text-text-primary">
                VALO<span className="text-accent">STATS</span>
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              {"Plateforme SaaS d'analyse et d'amélioration pour joueurs de Valorant."}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Application</h4>
            <ul className="space-y-2.5">
              <li><Link href="/dashboard" className="text-sm text-text-muted hover:text-text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/ai-coach" className="text-sm text-text-muted hover:text-text-primary transition-colors">AI Coach</Link></li>
              <li><Link href="/leaderboard" className="text-sm text-text-muted hover:text-text-primary transition-colors">Classement</Link></li>
              <li><Link href="/matches" className="text-sm text-text-muted hover:text-text-primary transition-colors">Matchs</Link></li>
              <li><Link href="/compare" className="text-sm text-text-muted hover:text-text-primary transition-colors">Comparaison</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Ressources</h4>
            <ul className="space-y-2.5">
              <li><Link href="/login" className="text-sm text-text-muted hover:text-text-primary transition-colors">Connexion</Link></li>
              <li><Link href="/register" className="text-sm text-text-muted hover:text-text-primary transition-colors">Inscription</Link></li>
              <li><Link href="/overlay" className="text-sm text-text-muted hover:text-text-primary transition-colors">Overlay</Link></li>
              <li><Link href="/u" className="text-sm text-text-muted hover:text-text-primary transition-colors">Profils publics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-4">Légal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/mentions-legales" className="text-sm text-text-muted hover:text-text-primary transition-colors">Mentions légales</Link></li>
              <li><Link href="/cgu" className="text-sm text-text-muted hover:text-text-primary transition-colors">{"Conditions d'utilisation"}</Link></li>
              <li><Link href="/confidentialite" className="text-sm text-text-muted hover:text-text-primary transition-colors">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} ValoStats. Tous droits réservés.
          </p>
          <p className="text-xs text-text-muted">
            {"Valorant est une marque déposée de Riot Games, Inc. ValoStats n'est pas affilié à Riot Games."}
          </p>
        </div>
      </div>
    </footer>
  );
}

