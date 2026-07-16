import { Badge } from "@/components/ui/badge";
import { WHY_INSTALL } from "./data";

export function PourquoiSection() {
  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="premium" size="sm" className="mb-4">
            Pourquoi installer
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Pourquoi installer ValoStats Companion ?
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_INSTALL.map((item, i) => (
            <div
              key={i}
              className="group bg-surface border border-border rounded-xl p-6 hover:border-accent/20 hover:bg-surface-hover/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">{item.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
