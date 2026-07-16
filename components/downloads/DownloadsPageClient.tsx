"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

function DownloadIcon() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function WindowsIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 0H11.377V11.377H0V0Z M12.623 0H24V11.377H12.623V0Z M0 12.623H11.377V24H0V12.623Z M12.623 12.623H24V24H12.623V12.623Z" />
    </svg>
  );
}

const FEATURES = [
  "Détection automatique de Valorant",
  "Analyse des 10 joueurs",
  "Rang compétitif",
  "Winrate",
  "KDA",
  "Agents favoris",
  "Style de jeu",
  "Conseils IA",
  "Ouverture automatique pendant l'Agent Select",
  "Synchronisation avec votre compte ValoStats",
  "Mises à jour automatiques",
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: "Le Companion est-il gratuit ?", a: "Oui." },
  { q: "Les données sont-elles synchronisées avec mon compte ValoStats ?", a: "Oui." },
  { q: "Le Companion détecte-t-il automatiquement Valorant ?", a: "Oui." },
  { q: "Faut-il laisser le Companion ouvert ?", a: "Oui, il fonctionne en arrière-plan." },
];

export function DownloadsPageClient() {
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <PageHeader
        icon={<DownloadIcon />}
        title="Téléchargements"
        description="Téléchargez les applications officielles de ValoStats."
      />

      <section>
        <Card padding="lg" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent-light text-accent">
                  <MonitorIcon />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">ValoStats Companion</h2>
                  <p className="text-sm text-text-muted mt-1">Application de bureau officielle</p>
                </div>
              </div>

              <p className="text-text-secondary leading-relaxed">
                ValoStats Companion est l&apos;application officielle de ValoStats. Elle détecte
                automatiquement Valorant et affiche un Pre Game Coach avant chaque partie afin
                d&apos;analyser vos alliés et vos adversaires en temps réel.
              </p>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <GridIcon />
                  Fonctionnalités
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="text-accent shrink-0">
                        <CheckIcon />
                      </span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <a
                  href="#"
                  className="inline-flex items-center gap-3 bg-accent hover:bg-accent-hover text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-200 hover-scale shadow-glow hover:shadow-glow"
                >
                  <ArrowDownIcon />
                  Télécharger ValoStats Companion
                </a>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center">
                      <WindowsIcon />
                    </div>
                  </div>
                  <div className="text-xs text-text-muted leading-tight">
                    <span className="text-text-primary font-medium">Windows</span>
                    <br />
                    Setup.exe
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <Card className="text-center space-y-1.5">
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Version</p>
                <p className="text-lg font-bold text-text-primary">v1.0.0</p>
              </Card>

              <Card className="space-y-2">
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Compatibilité</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="text-success"><CheckIcon /></span>
                    Windows 10
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="text-success"><CheckIcon /></span>
                    Windows 11
                  </div>
                </div>
              </Card>

              <Card className="text-center space-y-1.5">
                <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Statut</p>
                <Badge variant="success" size="md">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  Stable
                </Badge>
              </Card>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Aperçus</h2>
          <p className="text-sm text-text-muted mt-1">
            Découvrez l&apos;interface du Companion avant de le télécharger.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Dashboard Companion", desc: "Vue d'ensemble de votre compte et synchronisation" },
            { label: "Pre Game Coach", desc: "Analyse détaillée des joueurs avant la partie" },
            { label: "Overlay en jeu", desc: "Affichage transparent pendant la partie" },
            { label: "Paramètres", desc: "Configuration de l'application et de l'overlay" },
          ].map((item) => (
            <div
              key={item.label}
              className="group relative bg-surface border border-border rounded-xl overflow-hidden hover-scale transition-all duration-200"
            >
              <div className="aspect-video bg-gradient-to-br from-surface-elevated to-surface flex items-center justify-center">
                <div className="text-center space-y-3 p-6">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-accent-light text-accent flex items-center justify-center">
                    <MonitorIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                    <p className="text-xs text-text-muted mt-1">{item.desc}</p>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              <div className="px-4 py-3 border-t border-border">
                <p className="text-xs text-text-muted">
                  Capture d&apos;écran à venir
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Questions fréquentes</h2>
          <p className="text-sm text-text-muted mt-1">
            Tout ce que vous devez savoir sur le Companion.
          </p>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item) => (
            <details
              key={item.q}
              className="group bg-surface border border-border rounded-xl overflow-hidden transition-colors open:border-accent/30"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-text-primary hover:text-accent transition-colors list-none">
                {item.q}
                <span className="shrink-0 text-text-muted group-open:text-accent transition-colors duration-200">
                  <ChevronRight />
                </span>
              </summary>
              <div className="px-5 pb-4 pt-0 text-sm text-text-secondary border-t border-border/50">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
