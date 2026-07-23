import type { AnalysisInput, AnalysisResult, Insight, ScoreBreakdown, PlayerProfile, CoachingGoal, CoachingReport } from "./types";
import { InsightCategory, InsightSeverity } from "./types";

import { MIN_MATCHES_FOR_ANALYSIS, SCORE_BREAKDOWN_MAX_TOTAL, getScoreThreshold } from "@/constants/ai";

const MIN_MATCHES_FOR_RULES = MIN_MATCHES_FOR_ANALYSIS;

export function generateInsights(input: AnalysisInput): AnalysisResult {
  const { insights, scoreBreakdown, profile } = generateCoachingReport(input);

  const score = scoreBreakdown.overall;
  const summary = generateSummary(insights, score, input.stats, profile);

  return { score, summary, insights, engine: "heuristic" };
}

export function generateCoachingReport(input: AnalysisInput): CoachingReport {
  const insights = generateAllInsights(input);
  const scoreBreakdown = calculateScoreBreakdown(input);
  const profile = inferPlayerProfile(input);
  const goals = generateGoals(input, profile);

  const score = scoreBreakdown.overall;
  const summary = generateSummary(insights, score, input.stats, profile);
  const strengths = insights.filter((i) => i.severity === InsightSeverity.LOW);
  const weaknesses = insights.filter((i) => i.severity >= InsightSeverity.MEDIUM);

  return {
    score,
    summary,
    insights,
    engine: "heuristic",
    scoreBreakdown,
    profile,
    strengths,
    weaknesses,
    goals,
  };
}

function generateAllInsights(input: AnalysisInput): Insight[] {
  const insights: Insight[] = [];
  const { stats, agents, maps } = input;

  if (stats.matchCount < MIN_MATCHES_FOR_RULES) {
    insights.push({
      category: InsightCategory.GAME_SENSE,
      severity: InsightSeverity.LOW,
      problem: "Échantillon insuffisant",
      explanation: `Seulement ${stats.matchCount} matchs analysés. Les insights seront plus précis avec au moins ${MIN_MATCHES_FOR_RULES} parties.`,
      solution: "Continuez à jouer pour obtenir une analyse plus complète.",
      evidence: { matchCount: stats.matchCount, minimumRequired: MIN_MATCHES_FOR_RULES },
    });
    return insights;
  }

  insights.push(...analyzeKda(stats));
  insights.push(...analyzeWinRate(stats));
  insights.push(...analyzeHeadshotRate(stats));
  insights.push(...analyzeADR(stats));
  insights.push(...analyzeFirstDeathRate(stats));
  insights.push(...analyzeAttackDefense(stats));
  insights.push(...analyzeAgentDiversity(agents, stats));
  insights.push(...analyzeMapPerformance(maps, stats));
  insights.push(...analyzeUtilityUsage(stats));
  insights.push(...analyzeConsistency(stats));
  insights.push(...analyzeAgentDepth(agents));
  insights.push(...analyzeMapAdaptability(maps));
  insights.push(...analyzeCombatScore(stats));
  insights.push(...analyzeWinDepth(stats));

  return insights;
}

function analyzeKda(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];

  if (stats.averageKda < 0.7) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.CRITICAL,
      problem: "K/D Ratio critique",
      explanation: `Votre K/D de ${stats.averageKda.toFixed(2)} est très en dessous de la moyenne. Vous perdez la plupart de vos duels.`,
      solution: "Concentrez-vous sur le deathmatch et le range. Évitez les duels perdants et cherchez l'avantage numérique.",
      evidence: { averageKda: stats.averageKda, matchCount: stats.matchCount },
    });
  } else if (stats.averageKda < 0.95) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.HIGH,
      problem: "K/D Ratio insuffisant",
      explanation: `Votre K/D de ${stats.averageKda.toFixed(2)} est sous la moyenne (1.0). Vous perdez plus de duels que vous n'en gagnez.`,
      solution: "Travaillez votre crosshair placement et votre réactivité. Utilisez le deathmatch quotidiennement.",
      evidence: { averageKda: stats.averageKda },
    });
  } else if (stats.averageKda >= 1.0 && stats.averageKda < 1.2) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.MEDIUM,
      problem: "K/D Ratio moyen",
      explanation: `Votre K/D de ${stats.averageKda.toFixed(2)} est dans la moyenne. Des progrès sont possibles.`,
      solution: "Continuez à travailler votre viseur. Essayez d'atteindre 1.2+ pour être plus impactant.",
      evidence: { averageKda: stats.averageKda },
    });
  } else if (stats.averageKda >= 1.2 && stats.averageKda < 1.5) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.LOW,
      problem: "Bon K/D Ratio",
      explanation: `Votre K/D de ${stats.averageKda.toFixed(2)} est solide, au-dessus de la moyenne.`,
      solution: "Maintenez ce niveau. Essayez d'être plus clutch dans les moments décisifs.",
      evidence: { averageKda: stats.averageKda },
    });
  } else {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.LOW,
      problem: "K/D Ratio excellent",
      explanation: `Votre K/D de ${stats.averageKda.toFixed(2)} est excellent. Vous dominez vos duels.`,
      solution: "Vous pouvez commencer à entry-fragger plus souvent pour maximiser votre impact.",
      evidence: { averageKda: stats.averageKda },
    });
  }

  return insights;
}

function analyzeWinRate(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];

  if (stats.winRate < 40) {
    insights.push({
      category: InsightCategory.GAME_SENSE,
      severity: InsightSeverity.CRITICAL,
      problem: "Winrate critique",
      explanation: `Votre winrate de ${stats.winRate.toFixed(1)}% est très bas. Vous perdez significativement plus que vous ne gagnez.`,
      solution: "Analysez vos replays, concentrez-vous sur l'économie et la prise de décision. Évitez de jouer seul en ranked.",
      evidence: { winRate: stats.winRate, wins: stats.wins, losses: stats.losses },
    });
  } else if (stats.winRate < 48) {
    insights.push({
      category: InsightCategory.GAME_SENSE,
      severity: InsightSeverity.HIGH,
      problem: "Winrate insuffisant",
      explanation: `Votre winrate de ${stats.winRate.toFixed(1)}% est sous la moyenne. Objectif : 50%+.`,
      solution: "Améliorez votre macro-game et votre communication. Jouez avec un duo si possible.",
      evidence: { winRate: stats.winRate, wins: stats.wins, losses: stats.losses },
    });
  } else if (stats.winRate >= 50 && stats.winRate < 55) {
    insights.push({
      category: InsightCategory.GAME_SENSE,
      severity: InsightSeverity.LOW,
      problem: "Winrate équilibré",
      explanation: `Votre winrate de ${stats.winRate.toFixed(1)}% est dans la moyenne positive.`,
      solution: "Continuez comme ça. Pour progresser, identifiez ce qui fait la différence dans vos défaites.",
      evidence: { winRate: stats.winRate },
    });
  } else if (stats.winRate >= 55) {
    insights.push({
      category: InsightCategory.GAME_SENSE,
      severity: InsightSeverity.LOW,
      problem: "Excellent winrate",
      explanation: `Votre winrate de ${stats.winRate.toFixed(1)}% est excellent. Vous contribuez grandement aux victoires.`,
      solution: "Envisagez de jouer en compétition ou de tryhard le ranked. Vous avez le niveau pour grimper.",
      evidence: { winRate: stats.winRate },
    });
  }

  return insights;
}

function analyzeHeadshotRate(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];

  if (stats.headshotRate < 15) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.HIGH,
      problem: "Taux de headshot très faible",
      explanation: `Seulement ${stats.headshotRate.toFixed(1)}% de tirs à la tête. Vous visez trop le corps.`,
      solution: "Pratiquez le crosshair placement à hauteur de tête. Utilisez le mode entraînement et le deathmatch.",
      evidence: { headshotRate: stats.headshotRate },
    });
  } else if (stats.headshotRate < 22) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.MEDIUM,
      problem: "Taux de headshot en dessous de la moyenne",
      explanation: `Votre headshot rate de ${stats.headshotRate.toFixed(1)}% est sous la moyenne (25%).`,
      solution: "Travaillez votre visée verticale et votre placement de crosshair pré-aim.",
      evidence: { headshotRate: stats.headshotRate },
    });
  } else if (stats.headshotRate > 30) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.LOW,
      problem: "Excellente précision",
      explanation: `Votre headshot rate de ${stats.headshotRate.toFixed(1)}% est excellent.`,
      solution: "Votre visée est un point fort. Maintenez-la en vous échauffant avant chaque session.",
      evidence: { headshotRate: stats.headshotRate },
    });
  }

  return insights;
}

function analyzeADR(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];

  if (stats.damagePerRound < 100) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.HIGH,
      problem: "Dégâts par round faibles",
      explanation: `Seulement ${stats.damagePerRound.toFixed(1)} ADR. Vous ne faites pas assez de dégâts pour impacter les rounds.`,
      solution: "Travaillez votre agressivité contrôlée. Prenez plus de duels favorables et améliorez votre spray control.",
      evidence: { damagePerRound: stats.damagePerRound },
    });
  } else if (stats.damagePerRound < 130) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.MEDIUM,
      problem: "Dégâts par round moyens",
      explanation: `${stats.damagePerRound.toFixed(1)} ADR est dans la moyenne basse. Visez 150+ pour plus d'impact.`,
      solution: "Cherchez plus de combats sans être imprudent. Travaillez votre peek et votre trade.",
      evidence: { damagePerRound: stats.damagePerRound },
    });
  } else if (stats.damagePerRound > 160) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.LOW,
      problem: "Dégâts par round excellents",
      explanation: `${stats.damagePerRound.toFixed(1)} ADR est excellent. Vous impactez chaque round.`,
      solution: "Continuez à maintenir cette pression. Vous êtes un atout offensif pour votre équipe.",
      evidence: { damagePerRound: stats.damagePerRound },
    });
  }

  return insights;
}

function analyzeFirstDeathRate(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];

  if (stats.firstDeathRate > 35) {
    insights.push({
      category: InsightCategory.POSITIONING,
      severity: InsightSeverity.CRITICAL,
      problem: "Taux de première mort critique",
      explanation: `Vous mourez en premier dans ${stats.firstDeathRate.toFixed(1)}% des rounds. C'est très handicapant pour votre équipe.`,
      solution: "Ne rush pas sans information. Utilisez plus vos capacités pour vous déplacer. Attendez vos coéquipiers.",
      evidence: { firstDeathRate: stats.firstDeathRate },
    });
  } else if (stats.firstDeathRate > 25) {
    insights.push({
      category: InsightCategory.POSITIONING,
      severity: InsightSeverity.HIGH,
      problem: "Premières morts trop fréquentes",
      explanation: `${stats.firstDeathRate.toFixed(1)}% de premières morts. Votre positionnement est risqué.`,
      solution: "Améliorez votre patience et utilisez les utilités pour prendre l'information sans vous exposer.",
      evidence: { firstDeathRate: stats.firstDeathRate },
    });
  } else if (stats.firstDeathRate > 18) {
    insights.push({
      category: InsightCategory.POSITIONING,
      severity: InsightSeverity.MEDIUM,
      problem: "Positionnement perfectible",
      explanation: `${stats.firstDeathRate.toFixed(1)}% de premières morts. Vous pouvez améliorer votre survie en début de round.`,
      solution: "Évitez les angles ouverts. Utilisez jiggle peek plutôt que wide swing pour prendre l'info.",
      evidence: { firstDeathRate: stats.firstDeathRate },
    });
  } else if (stats.firstDeathRate < 12) {
    insights.push({
      category: InsightCategory.POSITIONING,
      severity: InsightSeverity.LOW,
      problem: "Excellent positionnement",
      explanation: `Seulement ${stats.firstDeathRate.toFixed(1)}% de premières morts. Vous survivez bien en début de round.`,
      solution: "Votre positionnement est un point fort. Continuez à jouer patient.",
      evidence: { firstDeathRate: stats.firstDeathRate },
    });
  }

  return insights;
}

function analyzeAttackDefense(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];
  const diff = stats.attackWinRate - stats.defenseWinRate;
  const absDiff = Math.abs(diff);

  if (absDiff > 20) {
    const side = diff > 0 ? "attaque" : "défense";
    const weakSide = diff > 0 ? "défense" : "attaque";
    const strongRate = diff > 0 ? stats.attackWinRate : stats.defenseWinRate;
    const weakRate = diff > 0 ? stats.defenseWinRate : stats.attackWinRate;

    insights.push({
      category: InsightCategory.GAME_SENSE,
      severity: InsightSeverity.HIGH,
      problem: `Déséquilibre marqué ${side}/${weakSide}`,
      explanation: `${strongRate.toFixed(1)}% en ${side} vs ${weakRate.toFixed(1)}% en ${weakSide}. Un écart de ${absDiff.toFixed(1)} points.`,
      solution: diff > 0
        ? `Travaillez votre ${weakSide} : anchoring, rotations, gestion des post-plants.`
        : `Travaillez votre ${weakSide} : prises d'info, coordination d'équipe, exécution de sites.`,
      evidence: { attackWinRate: stats.attackWinRate, defenseWinRate: stats.defenseWinRate, difference: absDiff },
    });
  } else if (absDiff > 10) {
    insights.push({
      category: InsightCategory.GAME_SENSE,
      severity: InsightSeverity.MEDIUM,
      problem: "Léger déséquilibre attaque/défense",
      explanation: `${diff > 0 ? stats.attackWinRate.toFixed(1) : stats.defenseWinRate.toFixed(1)}% en ${diff > 0 ? "attaque" : "défense"} contre ${diff > 0 ? stats.defenseWinRate.toFixed(1) : stats.attackWinRate.toFixed(1)}% sur l'autre côté.`,
      solution: "Analysez votre jeu sur votre côté faible. Un petit ajustement peut faire la différence.",
      evidence: { attackWinRate: stats.attackWinRate, defenseWinRate: stats.defenseWinRate },
    });
  }

  return insights;
}

function analyzeAgentDiversity(agents: AnalysisInput["agents"], stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];

  if (agents.length === 0) return insights;

  const topAgent = agents[0];
  const agentDiversity = agents.length;

  if (agentDiversity === 1 && stats.matchCount >= 10) {
    insights.push({
      category: InsightCategory.AGENT_MASTERY,
      severity: InsightSeverity.HIGH,
      problem: "Dépendance à un seul agent",
      explanation: `Vous ne jouez que ${topAgent.agentName} sur ${stats.matchCount} parties. Si on vous le pick/ban, vous êtes en difficulté.`,
      solution: "Apprenez 2 agents supplémentaires dans des rôles différents pour être plus polyvalent.",
      evidence: { agentCount: agentDiversity, mainAgent: topAgent.agentName, matchCount: stats.matchCount },
    });
  } else if (agentDiversity <= 2 && stats.matchCount >= 20) {
    insights.push({
      category: InsightCategory.AGENT_MASTERY,
      severity: InsightSeverity.MEDIUM,
      problem: "Pool d'agents limité",
      explanation: `Seulement ${agentDiversity} agents joués régulièrement. Un pool plus large vous rendrait plus adaptable.`,
      solution: "Ajoutez 1-2 agents à votre répertoire, idéalement avec des rôles complémentaires.",
      evidence: { agentCount: agentDiversity, mainAgent: topAgent.agentName },
    });
  } else if (agentDiversity >= 4) {
    insights.push({
      category: InsightCategory.AGENT_MASTERY,
      severity: InsightSeverity.LOW,
      problem: "Bonne diversité d'agents",
      explanation: `Vous jouez ${agentDiversity} agents différents, ce qui montre une bonne adaptabilité.`,
      solution: "Continuez à diversifier votre pool. La polyvalence est un atout en ranked.",
      evidence: { agentCount: agentDiversity },
    });
  }

  if (topAgent.matchCount >= 10 && topAgent.winRate < 45) {
    insights.push({
      category: InsightCategory.AGENT_MASTERY,
      severity: InsightSeverity.HIGH,
      problem: `Performance faible sur ${topAgent.agentName}`,
      explanation: `${topAgent.matchCount} parties avec ${topAgent.agentName} pour seulement ${topAgent.winRate.toFixed(1)}% de winrate.`,
      solution: `Envisagez de changer d'agent principal ou de revoir votre gameplay spécifique à ${topAgent.agentName}.`,
      evidence: { agentName: topAgent.agentName, matchCount: topAgent.matchCount, winRate: topAgent.winRate },
    });
  }

  const underperformingAgents = agents.filter((a) => a.matchCount >= 5 && a.winRate < 40);
  if (underperformingAgents.length > 0) {
    insights.push({
      category: InsightCategory.AGENT_MASTERY,
      severity: InsightSeverity.MEDIUM,
      problem: "Agents à éviter en ranked",
      explanation: `${underperformingAgents.map((a) => `${a.agentName} (${a.winRate.toFixed(1)}%)`).join(", ")}. Vos performances sont faibles sur ces agents.`,
      solution: "Évitez ces agents en ranked jusqu'à avoir suffisamment pratiqué en normaux.",
      evidence: { underperformingAgents: underperformingAgents.map((a) => ({ agentName: a.agentName, winRate: a.winRate })) },
    });
  }

  if (topAgent.matchCount >= 15 && topAgent.winRate > 58) {
    insights.push({
      category: InsightCategory.AGENT_MASTERY,
      severity: InsightSeverity.LOW,
      problem: `Maîtrise de ${topAgent.agentName}`,
      explanation: `${topAgent.winRate.toFixed(1)}% de winrate sur ${topAgent.agentName} sur ${topAgent.matchCount} parties. Vous maîtrisez bien cet agent.`,
      solution: "Continuez à jouer cet agent. Si possible, apprenez à le jouer dans différents styles.",
      evidence: { agentName: topAgent.agentName, winRate: topAgent.winRate, matchCount: topAgent.matchCount },
    });
  }

  return insights;
}

function analyzeMapPerformance(maps: AnalysisInput["maps"], stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];
  if (maps.length === 0) return insights;

  if (stats.worstMap) {
    const worstMapData = maps.find((m) => m.mapName === stats.worstMap);
    if (worstMapData && worstMapData.matchCount >= 3 && worstMapData.winRate < 35) {
      insights.push({
        category: InsightCategory.MAP_KNOWLEDGE,
        severity: InsightSeverity.HIGH,
        problem: `Map difficile : ${stats.worstMap}`,
        explanation: `Seulement ${worstMapData.winRate.toFixed(1)}% de winrate sur ${stats.worstMap} en ${worstMapData.matchCount} parties.`,
        solution: `Regardez des guides sur ${stats.worstMap}. Apprenez les lineups et les positions clés spécifiques à cette map.`,
        evidence: { mapName: stats.worstMap, winRate: worstMapData.winRate, matchCount: worstMapData.matchCount },
      });
    }
  }

  if (stats.bestMap) {
    const bestMapData = maps.find((m) => m.mapName === stats.bestMap);
    if (bestMapData && bestMapData.matchCount >= 3 && bestMapData.winRate > 60) {
      insights.push({
        category: InsightCategory.MAP_KNOWLEDGE,
        severity: InsightSeverity.LOW,
        problem: `Map favorite : ${stats.bestMap}`,
        explanation: `${bestMapData.winRate.toFixed(1)}% de winrate sur ${stats.bestMap}. C'est votre meilleure map.`,
        solution: "Essayez de reproduire ce qui fonctionne sur cette map sur les autres cartes.",
        evidence: { mapName: stats.bestMap, winRate: bestMapData.winRate, matchCount: bestMapData.matchCount },
      });
    }
  }

  const mapDiversity = maps.length;
  if (mapDiversity <= 2 && stats.matchCount >= 20) {
    const mapList = maps.map((m) => m.mapName).join(", ");
    insights.push({
      category: InsightCategory.MAP_KNOWLEDGE,
      severity: InsightSeverity.MEDIUM,
      problem: "Variété de maps limitée",
      explanation: `Vous jouez principalement sur ${mapDiversity} maps : ${mapList}. Découvrir d'autres maps améliorerait votre jeu global.`,
      solution: "Jouez toutes les maps en rotation pour améliorer votre connaissance générale.",
      evidence: { mapCount: mapDiversity, maps: mapList },
    });
  }

  return insights;
}

function analyzeUtilityUsage(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];

  if (stats.utilityPerRound < 0.5) {
    insights.push({
      category: InsightCategory.TEAMWORK,
      severity: InsightSeverity.HIGH,
      problem: "Utilisation d'utilités insuffisante",
      explanation: `Seulement ${stats.utilityPerRound.toFixed(2)} utilités par round. Vous n'utilisez pas assez vos capacités.`,
      solution: "Utilisez systématiquement vos utilités en début de round. Même imparfaites, elles apportent de la valeur.",
      evidence: { utilityPerRound: stats.utilityPerRound },
    });
  } else if (stats.utilityPerRound < 1.0) {
    insights.push({
      category: InsightCategory.TEAMWORK,
      severity: InsightSeverity.MEDIUM,
      problem: "Utilisation d'utilités modérée",
      explanation: `${stats.utilityPerRound.toFixed(2)} utilités par round. Vous pourriez être plus utile avec plus d'utilisation de capacités.`,
      solution: "Essayez d'utiliser au moins une utilité par round, même pour de l'information ou du zoning.",
      evidence: { utilityPerRound: stats.utilityPerRound },
    });
  } else if (stats.utilityPerRound >= 1.5) {
    insights.push({
      category: InsightCategory.TEAMWORK,
      severity: InsightSeverity.LOW,
      problem: "Bonne utilisation des utilités",
      explanation: `${stats.utilityPerRound.toFixed(2)} utilités par round. Vous utilisez bien vos capacités pour aider l'équipe.`,
      solution: "Continuez à bien gérer vos utilités. Pensez à les conserver pour les moments clés.",
      evidence: { utilityPerRound: stats.utilityPerRound },
    });
  }

  return insights;
}

function analyzeConsistency(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];

  if (stats.matchCount >= 15) {
    const volatility = Math.abs(stats.winRate - 50);

    if (volatility < 5) {
      insights.push({
        category: InsightCategory.CONSISTENCY,
        severity: InsightSeverity.LOW,
        problem: "Performance stable",
        explanation: `Votre winrate de ${stats.winRate.toFixed(1)}% est très proche de 50%, montrant une grande régularité.`,
        solution: "C'est un bon socle. Pour progresser, identifiez les moments où vous perdez des rounds serrés.",
        evidence: { winRate: stats.winRate, matchCount: stats.matchCount },
      });
    } else if (volatility > 20) {
      insights.push({
        category: InsightCategory.CONSISTENCY,
        severity: InsightSeverity.MEDIUM,
        problem: "Performance irrégulière",
        explanation: `Votre winrate de ${stats.winRate.toFixed(1)}% s'écarte significativement de 50%, suggérant une irrégularité.`,
        solution: "Travaillez votre constance. Établissez une routine d'échauffement avant chaque session et évitez de jouer fatigué.",
        evidence: { winRate: stats.winRate, matchCount: stats.matchCount },
      });
    }
  }

  return insights;
}

function analyzeAgentDepth(agents: AnalysisInput["agents"]): Insight[] {
  const insights: Insight[] = [];
  if (agents.length < 2) return insights;

  const top3 = agents.slice(0, 3);
  const top3Kda = top3.reduce((sum, a) => sum + a.averageKda, 0) / top3.length;

  if (top3Kda < 0.85 && top3.every((a) => a.matchCount >= 5)) {
    insights.push({
      category: InsightCategory.AGENT_MASTERY,
      severity: InsightSeverity.MEDIUM,
      problem: "Difficultés multi-agents",
      explanation: `Votre K/D moyen sur vos 3 agents les plus joués est de ${top3Kda.toFixed(2)}. Vous peinez quel que soit l'agent.`,
      solution: "Concentrez-vous sur les fondamentaux avant la spécialisation. Le problème est peut-être générique.",
      evidence: { topAgents: top3.map((a) => a.agentName), averageKda: top3Kda },
    });
  }

  return insights;
}

function analyzeMapAdaptability(maps: AnalysisInput["maps"]): Insight[] {
  const insights: Insight[] = [];
  if (maps.length < 2) return insights;

  const winRates = maps.filter((m) => m.matchCount >= 3).map((m) => m.winRate);
  if (winRates.length >= 2) {
    const maxWr = Math.max(...winRates);
    const minWr = Math.min(...winRates);
    const spread = maxWr - minWr;

    if (spread > 30) {
      insights.push({
        category: InsightCategory.MAP_KNOWLEDGE,
        severity: InsightSeverity.MEDIUM,
        problem: "Écart de performance important entre maps",
        explanation: `Écart de ${spread.toFixed(1)} points entre votre meilleure et votre pire map. Vous êtes très inégal selon la carte.`,
        solution: "Concentrez-vous sur votre pire map pour réduire l'écart. Regardez des VOD de joueurs pro sur cette map.",
        evidence: { winRateSpread: spread, maxWinRate: maxWr, minWinRate: minWr },
      });
    }
  }

  return insights;
}

function analyzeCombatScore(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];

  if (stats.combatScore < 150) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.MEDIUM,
      problem: "Score de combat faible",
      explanation: `Votre combat score moyen de ${stats.combatScore.toFixed(1)} est en dessous des standards.`,
      solution: "Multipliez les actions à fort impact : kills multi, entry frags, clutchs. Chaque round compte.",
      evidence: { combatScore: stats.combatScore },
    });
  } else if (stats.combatScore > 250) {
    insights.push({
      category: InsightCategory.AIM,
      severity: InsightSeverity.LOW,
      problem: "Score de combat élevé",
      explanation: `${stats.combatScore.toFixed(1)} de combat score moyen. Vous êtes systématiquement impactant.`,
      solution: "Votre impact est excellent. Continuez à jouer avec confiance.",
      evidence: { combatScore: stats.combatScore },
    });
  }

  return insights;
}

function analyzeWinDepth(stats: AnalysisInput["stats"]): Insight[] {
  const insights: Insight[] = [];
  const kdaVsWinrate = stats.averageKda > 1.2 && stats.winRate < 48;

  if (kdaVsWinrate) {
    insights.push({
      category: InsightCategory.TEAMWORK,
      severity: InsightSeverity.MEDIUM,
      problem: "K/D correct mais winrate faible",
      explanation: `Vous avez un K/D de ${stats.averageKda.toFixed(2)} mais seulement ${stats.winRate.toFixed(1)}% de winrate. Vos kills ne se traduisent pas en victoires.`,
      solution: "Travaillez l'impact de vos kills : clutchs, rounds décisifs, trades. Préférez les kills qui font gagner des rounds.",
      evidence: { averageKda: stats.averageKda, winRate: stats.winRate },
    });
  }

  return insights;
}

export function calculateScoreBreakdown(input: AnalysisInput): ScoreBreakdown {
  const { stats } = input;

  const wr = stats.winRate;
  const winRateScore = clampScore(
    wr < 40 ? 0 : wr < 45 ? 5 : wr < 50 ? 10 : wr < 55 ? 15 : wr < 60 ? 20 : 25, 0, 25
  );

  const k = stats.averageKda;
  const kdaScore = clampScore(
    k < 0.7 ? 0 : k < 0.85 ? 5 : k < 1.0 ? 10 : k < 1.2 ? 15 : k < 1.5 ? 20 : 25, 0, 25
  );

  const hs = stats.headshotRate;
  const headshotRateScore = clampScore(
    hs < 15 ? 0 : hs < 20 ? 5 : hs < 25 ? 10 : hs < 30 ? 15 : 20, 0, 20
  );

  const adr = stats.damagePerRound;
  const damagePerRoundScore = clampScore(
    adr < 100 ? 0 : adr < 120 ? 5 : adr < 140 ? 10 : adr < 160 ? 15 : 20, 0, 20
  );

  const fd = stats.firstDeathRate;
  const firstDeathRateScore = clampScore(
    fd > 35 ? 0 : fd > 30 ? 2 : fd > 25 ? 4 : fd > 20 ? 6 : fd > 15 ? 8 : 10, 0, 10
  );

  const consistencyScore = clampScore(
    stats.matchCount < 15 ? 3 : Math.abs(stats.winRate - 50) < 5 ? 5 : Math.abs(stats.winRate - 50) < 15 ? 3 : 1, 0, 5
  );

  const agentMasteryScore = clampScore(
    computeAgentMasteryScore(input.agents, stats), 0, 10
  );

  const mapKnowledgeScore = clampScore(
    computeMapKnowledgeScore(input.maps, stats), 0, 10
  );

  const maxTotal = SCORE_BREAKDOWN_MAX_TOTAL;
  const rawTotal = kdaScore + winRateScore + headshotRateScore + damagePerRoundScore
    + firstDeathRateScore + consistencyScore + agentMasteryScore + mapKnowledgeScore;

  const overall = Math.round((rawTotal / maxTotal) * 100);

  return {
    overall,
    winRate: winRateScore,
    kda: kdaScore,
    headshotRate: headshotRateScore,
    damagePerRound: damagePerRoundScore,
    firstDeathRate: firstDeathRateScore,
    consistency: consistencyScore,
    agentMastery: agentMasteryScore,
    mapKnowledge: mapKnowledgeScore,
  };
}

function computeAgentMasteryScore(agents: AnalysisInput["agents"], stats: AnalysisInput["stats"]): number {
  if (agents.length === 0 || stats.matchCount < 5) return 5;

  let score = 5;

  const diversity = agents.length;
  if (diversity >= 4) score += 2;
  else if (diversity <= 2 && stats.matchCount >= 15) score -= 2;

  const topAgent = agents[0];
  if (topAgent.winRate > 58) score += 2;
  else if (topAgent.winRate < 45 && topAgent.matchCount >= 10) score -= 2;

  const underperforming = agents.filter((a) => a.matchCount >= 5 && a.winRate < 40);
  if (underperforming.length >= 2) score -= 1;

  return score;
}

function computeMapKnowledgeScore(maps: AnalysisInput["maps"], stats: AnalysisInput["stats"]): number {
  if (maps.length === 0 || stats.matchCount < 5) return 5;

  let score = 5;

  if (maps.length >= 4) score += 2;
  else if (maps.length <= 2 && stats.matchCount >= 15) score -= 1;

  const winRates = maps.filter((m) => m.matchCount >= 3).map((m) => m.winRate);
  if (winRates.length >= 2) {
    const spread = Math.max(...winRates) - Math.min(...winRates);
    if (spread > 30) score -= 1;
    else if (spread < 15) score += 1;
  }

  return score;
}

function clampScore(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function inferPlayerProfile(input: AnalysisInput): PlayerProfile {
  const { stats } = input;

  const highKda = stats.averageKda >= 1.2;
  const lowKda = stats.averageKda < 0.9;
  const highFirstDeath = stats.firstDeathRate > 25;
  const highADR = stats.damagePerRound > 150;
  const lowADR = stats.damagePerRound < 110;
  const attackStrong = stats.attackWinRate > stats.defenseWinRate + 10;
  const defenseStrong = stats.defenseWinRate > stats.attackWinRate + 10;
  const highUtility = stats.utilityPerRound >= 1.3;
  const lowUtility = stats.utilityPerRound < 0.7;
  const stable = Math.abs(stats.winRate - 50) < 8;
  const volatile = Math.abs(stats.winRate - 50) > 18;

  let playStyle: PlayerProfile["playStyle"] = "balanced";
  if (highKda && !lowUtility && highFirstDeath) playStyle = "aggressive";
  else if (highUtility && lowKda && lowADR) playStyle = "supportive";
  else if (volatile) playStyle = "inconsistent";

  let preferredSide: PlayerProfile["preferredSide"] = "balanced";
  if (attackStrong) preferredSide = "attack";
  else if (defenseStrong) preferredSide = "defense";

  const consistency: PlayerProfile["consistency"] = stable ? "stable" : volatile ? "volatile" : "improving";

  const mainStrengths: string[] = [];
  if (highKda) mainStrengths.push("Duels individuels");
  if (stats.headshotRate > 28) mainStrengths.push("Précision");
  if (highADR) mainStrengths.push("Impact par round");
  if (highUtility) mainStrengths.push("Utilisation des capacités");
  if (stats.firstDeathRate < 15) mainStrengths.push("Survie");
  if (stable) mainStrengths.push("Régularité");

  const priorityFocus: string[] = [];
  if (lowKda) priorityFocus.push("Améliorer le K/D");
  if (highFirstDeath) priorityFocus.push("Réduire les premières morts");
  if (stats.winRate < 48) priorityFocus.push("Augmenter le winrate");
  if (stats.headshotRate < 20) priorityFocus.push("Viser la tête");
  if (lowADR) priorityFocus.push("Augmenter l'ADR");
  if (lowUtility) priorityFocus.push("Utiliser plus d'utilités");

  return {
    playStyle,
    preferredSide,
    consistency,
    mainStrengths: mainStrengths.length > 0 ? mainStrengths : ["Aucun point fort majeur identifié"],
    priorityFocus: priorityFocus.length > 0 ? priorityFocus : ["Continuer à progresser"],
  };
}

function generateGoals(input: AnalysisInput, profile: PlayerProfile): CoachingGoal[] {
  const goals: CoachingGoal[] = [];
  const { stats } = input;

  const goalTemplates: Array<{
    condition: boolean;
    title: string;
    description: string;
    metric: string;
    targetValue: string;
    currentValue: string;
    difficulty: "easy" | "medium" | "hard";
    category: InsightCategory;
  }> = [
    {
      condition: stats.averageKda < 0.95,
      title: "Atteindre un K/D positif",
      description: "Gagner plus de duels que vous n'en perdez pour augmenter votre impact.",
      metric: "K/D Ratio",
      targetValue: "> 1.0",
      currentValue: stats.averageKda.toFixed(2),
      difficulty: "medium",
      category: InsightCategory.AIM,
    },
    {
      condition: stats.averageKda < 0.8,
      title: "Sortir du négatif en K/D",
      description: "Objectif intermédiaire : réduire l'écart de duels perdus.",
      metric: "K/D Ratio",
      targetValue: "> 0.8",
      currentValue: stats.averageKda.toFixed(2),
      difficulty: "hard",
      category: InsightCategory.AIM,
    },
    {
      condition: stats.winRate < 48,
      title: "Atteindre 50% de winrate",
      description: "Équilibrer votre ratio victoires/défaites.",
      metric: "Winrate",
      targetValue: "> 50%",
      currentValue: `${stats.winRate.toFixed(1)}%`,
      difficulty: "medium",
      category: InsightCategory.GAME_SENSE,
    },
    {
      condition: stats.winRate < 40,
      title: "Stabiliser le winrate",
      description: "Objectif prioritaire : atteindre au moins 45% de victoires.",
      metric: "Winrate",
      targetValue: "> 45%",
      currentValue: `${stats.winRate.toFixed(1)}%`,
      difficulty: "hard",
      category: InsightCategory.GAME_SENSE,
    },
    {
      condition: stats.headshotRate < 20,
      title: "Améliorer la précision",
      description: "Viser systématiquement à hauteur de tête pour augmenter vos headshots.",
      metric: "Headshot Rate",
      targetValue: "> 20%",
      currentValue: `${stats.headshotRate.toFixed(1)}%`,
      difficulty: "easy",
      category: InsightCategory.AIM,
    },
    {
      condition: stats.firstDeathRate > 25,
      title: "Réduire les premières morts",
      description: "Mourir moins souvent en premier pour donner plus de chances à votre équipe.",
      metric: "First Death Rate",
      targetValue: "< 25%",
      currentValue: `${stats.firstDeathRate.toFixed(1)}%`,
      difficulty: "medium",
      category: InsightCategory.POSITIONING,
    },
    {
      condition: stats.damagePerRound < 120,
      title: "Augmenter l'ADR",
      description: "Faire plus de dégâts par round pour impacter davantage le jeu.",
      metric: "ADR",
      targetValue: "> 120",
      currentValue: stats.damagePerRound.toFixed(1),
      difficulty: "medium",
      category: InsightCategory.AIM,
    },
    {
      condition: stats.utilityPerRound < 0.7,
      title: "Utiliser plus vos capacités",
      description: "Chaque capacité utilisée apporte un avantage, même mineur.",
      metric: "Utilités par round",
      targetValue: "> 0.7",
      currentValue: stats.utilityPerRound.toFixed(2),
      difficulty: "easy",
      category: InsightCategory.TEAMWORK,
    },
    {
      condition: profile.playStyle === "aggressive" && stats.firstDeathRate > 20,
      title: "Tempérer votre agressivité",
      description: "Votre style agressif vous fait mourir trop souvent en premier. Équilibrez risque et récompense.",
      metric: "First Death Rate",
      targetValue: "< 20%",
      currentValue: `${stats.firstDeathRate.toFixed(1)}%`,
      difficulty: "hard",
      category: InsightCategory.POSITIONING,
    },
  ];

  for (const t of goalTemplates) {
    if (t.condition) {
      goals.push({
        id: `goal-${goals.length + 1}`,
        title: t.title,
        description: t.description,
        metric: t.metric,
        targetValue: t.targetValue,
        currentValue: t.currentValue,
        difficulty: t.difficulty,
        category: t.category,
      });
    }
  }

  if (goals.length === 0) {
    goals.push({
      id: "goal-maintain",
      title: "Maintenir votre niveau",
      description: "Continuez à jouer régulièrement pour maintenir vos bonnes performances.",
      metric: "Score global",
      targetValue: "> 70",
      currentValue: "Score actuel",
      difficulty: "easy",
      category: InsightCategory.CONSISTENCY,
    });
  }

  return goals.slice(0, 5);
}

function generateSummary(insights: Insight[], score: number, stats: AnalysisInput["stats"], profile: PlayerProfile): string {
  const criticalIssues = insights.filter((i) => i.severity === InsightSeverity.CRITICAL);
  const highIssues = insights.filter((i) => i.severity === InsightSeverity.HIGH);
  const strengths = insights.filter((i) => i.severity === InsightSeverity.LOW);

  const levelLabel = getScoreThreshold(score).label;

  const summaryParts: string[] = [
    `Niveau ${levelLabel} (${score.toFixed(0)}/100). ${profile.playStyle === "aggressive" ? "Style de jeu agressif." : profile.playStyle === "supportive" ? "Style de jeu support." : profile.playStyle === "inconsistent" ? "Performance irrégulière." : "Style de jeu équilibré."}`,
  ];

  if (criticalIssues.length > 0) {
    summaryParts.push(`Points critiques : ${criticalIssues.map((i) => i.problem.toLowerCase()).join(", ")}.`);
  }

  if (highIssues.length > 0) {
    summaryParts.push(`Points à améliorer : ${highIssues.map((i) => i.problem.toLowerCase()).join(", ")}.`);
  }

  if (strengths.length > 0) {
    summaryParts.push(`Points forts : ${strengths.map((i) => i.problem.toLowerCase()).join(", ")}.`);
  }

  if (profile.mainStrengths.length > 0 && profile.mainStrengths[0] !== "Aucun point fort majeur identifié") {
    summaryParts.push(`Forces : ${profile.mainStrengths.join(", ")}.`);
  }

  if (profile.priorityFocus.length > 0 && profile.priorityFocus[0] !== "Continuer à progresser") {
    summaryParts.push(`Priorités : ${profile.priorityFocus.join(", ")}.`);
  }

  summaryParts.push(`Basé sur ${stats.matchCount} matchs analysés.`);

  return summaryParts.join(" ");
}
