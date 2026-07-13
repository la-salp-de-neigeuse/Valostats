"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const FAQS = [
  {
    q: "Comment ValoStats récupère mes données Valorant ?",
    a: "ValoStats utilise l'API officielle de Riot Games. Après avoir lié votre compte Riot, nous synchronisons automatiquement vos matchs. Vous pouvez déclencher une synchronisation manuelle à tout moment.",
  },
  {
    q: "ValoStats est-il gratuit ?",
    a: "Oui, un plan gratuit est disponible. Il inclut les statistiques de base, l'historique 30 jours et 5 analyses IA par mois. Le plan Premium à 9,99 €/mois débloque les analyses illimitées, les graphiques d'évolution et l'historique complet.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Absolument. Vos données sont chiffrées et stockées de manière sécurisée. Vous contrôlez la visibilité de votre profil : public, privé, ou visible uniquement via lien direct.",
  },
  {
    q: "Puis utiliser ValoStats pour mes streams ?",
    a: "Oui ! ValoStats propose un overlay personnalisable pour OBS, Streamlabs et TikTok Live. Choisissez vos widgets, couleurs et disposition pour un rendu professionnel.",
  },
  {
    q: "Comment fonctionne le coach IA ?",
    a: "Notre IA analyse automatiquement vos performances après chaque synchronisation. Elle identifie vos forces, faiblesses, et génère des recommandations personnalisées. Disponible via le plan gratuit (5/mois) ou illimité en Premium.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 lg:py-32 bg-surface/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="premium" size="sm" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Questions fréquentes
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-surface-hover/30"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-text-primary pr-4">{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 animate-slide-up">
                    <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
