import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function DashboardMockup() {
  return (
    <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-float">
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-hover/50 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
        <span className="text-xs text-text-muted ml-2">Tableau de bord</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 22 2 22 12 2" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="h-3 w-24 bg-surface-hover rounded" />
            <div className="h-2 w-16 bg-surface-hover rounded mt-1.5" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Winrate", "K/D", "Score IA"].map((label) => (
            <div key={label} className="bg-surface-hover/30 rounded-xl p-3 border border-border">
              <div className="h-6 w-12 bg-surface-hover rounded mb-1" />
              <div className="h-2 w-full bg-surface-hover rounded" />
            </div>
          ))}
        </div>
        <div className="bg-surface-hover/30 rounded-xl p-4 border border-border">
          <div className="h-2 w-20 bg-surface-hover rounded mb-3" />
          <svg className="w-full h-10" viewBox="0 0 200 40" fill="none">
            <path d="M0 32 Q25 28 50 20 T100 12 T150 16 T200 6" stroke="#FF4655" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M0 32 Q25 28 50 20 T100 12 T150 16 T200 6" stroke="url(#heroGrad)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF4655" stopOpacity="0" />
                <stop offset="50%" stopColor="#FF4655" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF4655" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-6 bg-surface-hover rounded" />
          <div className="flex-1 h-6 bg-surface-hover rounded" />
          <div className="flex-1 h-6 bg-surface-hover rounded" />
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-background pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                <Image
                  src="/logo.png"
                  alt="ValoStats"
                  fill
                  sizes="(max-width: 640px) 48px, 56px"
                  className="object-contain logo-image"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary tracking-tight">
                  VALO<span className="text-accent">STATS</span>
                </h1>
                <p className="text-sm sm:text-base text-text-muted">
                  Your Valorant performance, redefined.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-accent bg-accent-light px-3 py-1.5 rounded-full border border-accent/20">
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              {"Plateforme d'analyse Valorant"}
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight">
              Analysez vos performances{" "}
              <span className="text-transparent bg-clip-text bg-gradient-brand">
                Valorant
              </span>{" "}
              et progressez
            </h2>

            <p className="text-lg text-text-secondary leading-relaxed max-w-lg">
              ValoStats synchronise vos matchs, analyse vos statistiques et vous aide
              à comprendre votre jeu. Tableau de bord, coach IA et overlay stream inclus.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg" rightIcon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                }>
                  Créer un compte gratuit
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">Se connecter</Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-muted">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Synchronisation automatique
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Données Riot officielles
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Gratuit pour commencer
              </span>
            </div>
          </div>

          <div className="relative">
            <DashboardMockup />
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

