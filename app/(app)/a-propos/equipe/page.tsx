import { MEMBERS, CATEGORIES } from "@/components/team/members";
import { TeamCard } from "@/components/team/TeamCard";
import { ContributorCard } from "@/components/team/ContributorCard";

export const metadata = {
  title: "Équipe - ValoStats",
  description: "Découvrez l'équipe derrière ValoStats.",
};

export default function EquipePage() {
  const mainCategories = CATEGORIES.filter((c) => c.key !== "contributors");
  const contributors = MEMBERS.filter((m) => m.category === "contributors");

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <div className="w-14 h-14 rounded-2xl bg-gradient-brand-br flex items-center justify-center text-white font-bold text-xl mx-auto mb-5 shadow-lg shadow-accent-glow">
          V
        </div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
          {"Notre équipe"}
        </h1>
        <p className="mt-3 text-text-muted max-w-lg mx-auto leading-relaxed">
          {"Des passionnés de Valorant et de technologie qui construisent ValoStats."}
        </p>
      </div>

      <div className="space-y-12">
        {mainCategories.map((category) => {
          const members = MEMBERS.filter((m) => m.category === category.key);
          if (members.length === 0) return null;

          return (
            <section key={category.key}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl" role="img" aria-hidden="true">
                  {category.emoji}
                </span>
                <h2 className="text-lg font-bold text-text-primary">
                  {category.label}
                </h2>
                <span className="text-xs text-text-muted bg-surface-hover/50 border border-border rounded-full px-2.5 py-0.5">
                  {members.length}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member, i) => (
                  <TeamCard key={member.id} member={member} index={i} />
                ))}
              </div>
            </section>
          );
        })}

        {contributors.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl" role="img" aria-hidden="true">
                🤝
              </span>
              <h2 className="text-lg font-bold text-text-primary">
                Contributeurs
              </h2>
              <span className="text-xs text-text-muted bg-surface-hover/50 border border-border rounded-full px-2.5 py-0.5">
                {contributors.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {contributors.map((member, i) => (
                <ContributorCard key={member.id} member={member} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
