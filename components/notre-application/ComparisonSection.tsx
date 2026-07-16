import { Badge } from "@/components/ui/badge";
import { COMPARISON_ROWS } from "./data";

export function ComparisonSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="premium" size="sm" className="mb-4">
            Comparaison
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            ValoStats vs les autres trackers
          </h2>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-5 py-4 font-semibold text-text-primary min-w-[220px]">
                  Fonctionnalité
                </th>
                <th className="text-center px-5 py-4 font-bold text-accent min-w-[130px]">
                  <span className="flex items-center justify-center gap-1.5">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    ValoStats
                  </span>
                </th>
                <th className="text-center px-5 py-4 font-semibold text-text-secondary min-w-[110px]">
                  Tracker.gg
                </th>
                <th className="text-center px-5 py-4 font-semibold text-text-secondary min-w-[110px]">
                  Blitz.gg
                </th>
                <th className="text-center px-5 py-4 font-semibold text-text-secondary min-w-[110px]">
                  Autres
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-border/50 transition-colors hover:bg-surface-hover/20 ${i % 2 === 0 ? "bg-surface/10" : ""}`}
                >
                  <td className="px-5 py-3.5 text-text-primary font-medium">{row.feature}</td>
                  <td className="px-5 py-3.5 text-center">
                    {row.us === true ? (
                      <svg className="w-5 h-5 text-success mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span className="text-xs text-text-muted">{row.us}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center text-xs text-text-muted">{row.trackerA}</td>
                  <td className="px-5 py-3.5 text-center text-xs text-text-muted">{row.trackerB}</td>
                  <td className="px-5 py-3.5 text-center text-xs text-text-muted">{row.trackerC}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-text-muted text-center">
          Comparaison basée sur les fonctionnalités disponibles en juillet 2026.
        </p>
      </div>
    </section>
  );
}
