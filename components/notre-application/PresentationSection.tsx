import { Badge } from "@/components/ui/badge";

export function PresentationSection() {
  return (
    <section className="py-20 lg:py-28 bg-surface/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="premium" size="sm" className="mb-4">
            Présentation
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Qu&apos;est-ce que ValoStats Companion ?
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6">
            <p className="text-text-secondary leading-relaxed text-lg">
              ValoStats Companion est une application Windows native qui fait le pont
              entre votre jeu et la plateforme ValoStats.
            </p>
            <p className="text-text-secondary leading-relaxed">
              Installée en un clic, elle détecte automatiquement le lancement de
              Valorant, suit vos parties en temps réel et affiche un overlay
              transparent avec les statistiques et analyses IA de tous les joueurs
              — sans jamais avoir à quitter le jeu ou ouvrir un navigateur.
            </p>
            <div className="pt-4 space-y-4">
              {[
                "Détection automatique du jeu en arrière-plan",
                "Overlay Pre Game Coach avec animations fluides",
                "Analyse IA des adversaires avant chaque round",
                "Fonctionne en silence dans la barre des tâches",
                "Mise à jour automatique dès qu'une nouvelle version est disponible",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-surface border border-border rounded-2xl overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-ai-purple flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <p className="text-text-muted text-sm">Aperçu de l&apos;application</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
