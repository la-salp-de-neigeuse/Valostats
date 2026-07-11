export const PROMPT_VERSION = "2.0.0";

export interface PromptBuilderInput {
  playerName: string;
  matchCount: number;
  wins: number;
  losses: number;
  winRate: number;
  averageKda: number;
  headshotRate: number;
  damagePerRound: number;
  firstDeathRate: number;
  attackWinRate: number;
  defenseWinRate: number;
  currentRank?: string;
  topAgents: Array<{ name: string; matches: number; winRate: number; kda: number }>;
  mapStats: Array<{ name: string; matches: number; winRate: number }>;
  profile?: {
    playStyle: string;
    preferredSide: string;
    consistency: string;
    mainStrengths: string[];
    priorityFocus: string[];
  };
  currentScore?: number;
  currentSummary?: string;
  currentGoals?: Array<{
    title: string;
    description: string;
    metric: string;
    targetValue: string;
    difficulty: string;
  }>;
  previousSummary?: string;
  recentMatches?: Array<{
    result: string;
    mapName: string;
    agentName: string;
    kills: number;
    deaths: number;
    assists: number;
    score: number;
    queue: string;
  }>;
}

export interface LLMPrompt {
  promptVersion: string;
  systemPrompt: string;
  userPrompt: string;
}

function formatStatsBlock(input: PromptBuilderInput): string[] {
  const lines: string[] = [
    `Joueur : ${input.playerName}`,
    `Matchs : ${input.matchCount}`,
    `Victoires : ${input.wins}`,
    `Défaites : ${input.losses}`,
    `Winrate : ${input.winRate.toFixed(1)}%`,
    `KDA moyen : ${input.averageKda.toFixed(2)}`,
    `Headshot : ${input.headshotRate.toFixed(1)}%`,
    `Dégâts/Round : ${input.damagePerRound.toFixed(1)}`,
    `First Death Rate : ${input.firstDeathRate.toFixed(1)}%`,
    `Winrate Attaque : ${input.attackWinRate.toFixed(1)}%`,
    `Winrate Défense : ${input.defenseWinRate.toFixed(1)}%`,
  ];

  if (input.currentRank) {
    lines.push(`Rang actuel : ${input.currentRank}`);
  }

  return lines;
}

function formatAgentsBlock(input: PromptBuilderInput): string[] {
  if (input.topAgents.length === 0) return [];

  const lines: string[] = ["", "=== AGENTS ==="];
  for (const a of input.topAgents) {
    lines.push(
      `  ${a.name}: ${a.matches} matchs, ${a.winRate.toFixed(1)}% winrate, ${a.kda.toFixed(2)} KDA`,
    );
  }
  return lines;
}

function formatMapsBlock(input: PromptBuilderInput): string[] {
  if (input.mapStats.length === 0) return [];

  const lines: string[] = ["", "=== CARTES ==="];
  for (const m of input.mapStats) {
    lines.push(
      `  ${m.name}: ${m.matches} matchs, ${m.winRate.toFixed(1)}% winrate`,
    );
  }
  return lines;
}

function formatProfileBlock(input: PromptBuilderInput): string[] {
  if (!input.profile) return [];

  const lines: string[] = ["", "=== PROFIL JOUEUR ==="];
  lines.push(`Style de jeu : ${input.profile.playStyle}`);
  lines.push(`Côté préféré : ${input.profile.preferredSide}`);
  lines.push(`Consistance : ${input.profile.consistency}`);
  if (input.profile.mainStrengths.length > 0) {
    lines.push(`Forces principales : ${input.profile.mainStrengths.join(", ")}`);
  }
  if (input.profile.priorityFocus.length > 0) {
    lines.push(`Points à travailler : ${input.profile.priorityFocus.join(", ")}`);
  }
  return lines;
}

function formatCurrentAnalysisBlock(input: PromptBuilderInput): string[] {
  if (input.currentScore === undefined && !input.currentSummary) return [];

  const lines: string[] = ["", "=== ANALYSE IA ACTUELLE ==="];
  if (input.currentScore !== undefined) {
    lines.push(`Score IA : ${input.currentScore}/100`);
  }
  if (input.currentSummary) {
    lines.push(`Résumé IA : ${input.currentSummary}`);
  }
  return lines;
}

function formatGoalsBlock(input: PromptBuilderInput): string[] {
  if (!input.currentGoals || input.currentGoals.length === 0) return [];

  const lines: string[] = ["", "=== OBJECTIFS ACTUELS ==="];
  for (const g of input.currentGoals) {
    lines.push(`  - ${g.title}: ${g.description} (${g.metric}: ${g.targetValue}, ${g.difficulty})`);
  }
  return lines;
}

function formatPreviousSummaryBlock(input: PromptBuilderInput): string[] {
  if (!input.previousSummary) return [];

  return ["", "=== RÉSUMÉ PRÉCÉDENT ===", input.previousSummary];
}

function formatRecentMatchesBlock(input: PromptBuilderInput): string[] {
  if (!input.recentMatches || input.recentMatches.length === 0) return [];

  const lines: string[] = ["", "=== DERNIERS MATCHS (20 max) ==="];
  for (const m of input.recentMatches.slice(0, 20)) {
    lines.push(
      `  ${m.result === "WIN" ? "VICTOIRE" : "DÉFAITE"} — ${m.mapName} (${m.agentName}): ${m.kills}/${m.deaths}/${m.assists} — ${m.score} pts — ${m.queue}`,
    );
  }
  return lines;
}

function buildSystemPrompt(): string {
  return `Tu es un coach IA expert pour le jeu Valorant. Analyse les données ci-dessous et produis une évaluation complète.

RÈGLES STRICTES — À RESPECTER IMPÉRATIVEMENT :
1. N'invente AUCUNE statistique, match, agent, carte ou rang. Utilise UNIQUEMENT les données fournies.
2. Si une donnée est absente, ne l'invente pas.
3. Produis EXACTEMENT 3 forces, 3 faiblesses, 3 recommandations et 3 objectifs.
4. Chaque objectif doit avoir un titre, une description, une métrique, une valeur cible et une difficulté (easy, medium, hard).
5. Le niveau estimé doit coïncider avec les performances réelles fournies.
6. La probabilité de progression (0-100) reflète la marge de progression visible dans les données.
7. Tous les textes doivent être en français.

Réponds UNIQUEMENT avec un objet JSON valide — aucun texte avant ni après. Schéma JSON exact :
{
  "summary": "Résumé de 3-4 phrases en français",
  "strengths": ["Force 1", "Force 2", "Force 3"],
  "weaknesses": ["Faiblesse 1", "Faiblesse 2", "Faiblesse 3"],
  "recommendations": ["Recommandation 1", "Recommandation 2", "Recommandation 3"],
  "goals": [
    { "title": "...", "description": "...", "metric": "...", "targetValue": "...", "difficulty": "easy" },
    { "title": "...", "description": "...", "metric": "...", "targetValue": "...", "difficulty": "medium" },
    { "title": "...", "description": "...", "metric": "...", "targetValue": "...", "difficulty": "hard" }
  ],
  "estimatedRank": "Rang estimé (ex: Or 2)",
  "progressionProbability": 65
}`;
}

function buildUserPrompt(input: PromptBuilderInput): string {
  const sections = [
    ...formatStatsBlock(input),
    ...formatAgentsBlock(input),
    ...formatMapsBlock(input),
    ...formatProfileBlock(input),
    ...formatCurrentAnalysisBlock(input),
    ...formatGoalsBlock(input),
    ...formatPreviousSummaryBlock(input),
    ...formatRecentMatchesBlock(input),
  ];

  return sections.join("\n");
}

export function buildPrompt(input: PromptBuilderInput): LLMPrompt {
  return {
    promptVersion: PROMPT_VERSION,
    systemPrompt: buildSystemPrompt(),
    userPrompt: buildUserPrompt(input),
  };
}
