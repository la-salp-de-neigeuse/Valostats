import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ScreenshotsSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="premium" size="sm" className="mb-4">
            Captures d&apos;écran
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            L&apos;application en images
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {[
            {
              label: "Application en mode silencieux",
              desc: "L'application se niche dans la barre des tâches et ne se manifeste que quand vous en avez besoin.",
            },
            {
              label: "Overlay Pre Game Coach",
              desc: "L'overlay s'affiche automatiquement pendant la sélection d'agent avec les profils de tous les joueurs.",
            },
            {
              label: "Paramètres et configuration",
              desc: "Un tableau de bord complet pour personnaliser l'application selon vos préférences.",
            },
            {
              label: "Mise à jour automatique",
              desc: "L'application vérifie et installe les mises à jour automatiquement.",
            },
          ].map((item, i) => (
            <Card key={i} hover className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-surface-hover to-surface flex items-center justify-center border-b border-border">
                <div className="text-center p-6">
                  <div className="w-14 h-14 rounded-xl bg-surface border border-border flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                  <p className="text-text-muted text-sm">Capture d&apos;écran à venir</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{item.label}</h3>
                <p className="text-xs text-text-secondary">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
