export type TeamCategory =
  | "co-founder"
  | "developers"
  | "designers"
  | "moderators"
  | "testers"
  | "contributors";

export interface TeamMember {
  id: string;
  pseudo: string;
  role: string;
  description: string;
  category: TeamCategory;
}

export const CATEGORIES: { key: TeamCategory; label: string; emoji: string }[] = [
  { key: "co-founder", label: "Cofondateur", emoji: "👑" },
  { key: "developers", label: "Développeurs", emoji: "💻" },
  { key: "designers", label: "Designer", emoji: "🎨" },
  { key: "moderators", label: "Modérateur", emoji: "🛡️" },
  { key: "testers", label: "Testeur", emoji: "🧪" },
  { key: "contributors", label: "Contributeurs", emoji: "🤝" },
];

export const MEMBERS: TeamMember[] = [
  {
    id: "last-sherk-founder",
    pseudo: "Last Sherk",
    role: "Cofondateur",
    description:
      "Cofondateur du projet ValoStats et responsable de son évolution.",
    category: "co-founder",
  },
  {
    id: "lezox-dev",
    pseudo: "Lezox",
    role: "Développeur",
    description:
      "Développement des fonctionnalités et de l'interface.",
    category: "developers",
  },
  {
    id: "last-sherk-dev",
    pseudo: "Last Sherk",
    role: "Développeur",
    description:
      "Architecture et développement de la plateforme.",
    category: "developers",
  },
  {
    id: "lezox-designer",
    pseudo: "Lezox",
    role: "Designer",
    description:
      "Conception de l'identité visuelle et de l'expérience utilisateur.",
    category: "designers",
  },
  {
    id: "stynox-mod",
    pseudo: "Stynox",
    role: "Modérateur",
    description:
      "Gestion de la communauté et modération.",
    category: "moderators",
  },
  {
    id: "swirl-tester",
    pseudo: "Swirl",
    role: "Testeur",
    description:
      "Tests des fonctionnalités et remontée des bugs.",
    category: "testers",
  },
  {
    id: "swirl-contrib",
    pseudo: "Swirl",
    role: "Contributeur",
    description: "",
    category: "contributors",
  },
  {
    id: "last-sherk-contrib",
    pseudo: "Last Sherk",
    role: "Contributeur",
    description: "",
    category: "contributors",
  },
  {
    id: "tym-contrib",
    pseudo: "Tym",
    role: "Contributeur",
    description: "",
    category: "contributors",
  },
  {
    id: "stynox-contrib",
    pseudo: "Stynox",
    role: "Contributeur",
    description: "",
    category: "contributors",
  },
];
