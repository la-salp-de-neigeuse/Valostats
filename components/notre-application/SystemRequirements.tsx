import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SYSTEM_REQUIREMENTS } from "./data";

export function SystemRequirements() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="premium" size="sm" className="mb-4">
            Configuration
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Configuration minimale
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">
            ValoStats Companion est conçu pour être léger et ne pas impacter
            vos performances de jeu.
          </p>
        </div>
        <Card>
          <div className="divide-y divide-border/50">
            {SYSTEM_REQUIREMENTS.map((req, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface-hover/20 transition-colors"
              >
                <span className="text-sm text-text-secondary">{req.label}</span>
                <span className="text-sm font-medium text-text-primary text-right max-w-[60%]">{req.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
