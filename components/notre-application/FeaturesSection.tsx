import { Badge } from "@/components/ui/badge";
import { FEATURES } from "./data";

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-surface/20 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ai-purple/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="premium" size="sm" className="mb-4">
            Fonctionnalités
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Tout ce dont vous avez besoin, dans une seule application
          </h2>
          <p className="mt-4 text-text-secondary max-w-2xl mx-auto">
            ValoStats Companion réunit les fonctionnalités essentielles pour
            optimiser vos performances sans jamais quitter le jeu.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feat, i) => (
            <div
              key={i}
              className="group bg-surface border border-border rounded-xl p-6 hover:border-accent/20 hover:bg-surface-hover/20 transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-ai-purple/20 text-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {feat.icon}
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">{feat.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed flex-1">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
