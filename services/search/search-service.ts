import { prisma } from "@/lib/prisma/client";
import type { SearchResult } from "./types";

const PAGE_ENTRIES: SearchResult[] = [
  { id: "page-dashboard", category: "pages", label: "Dashboard", description: "Aperçu de vos performances", href: "/dashboard", icon: "📊" },
  { id: "page-matchs", category: "pages", label: "Matchs", description: "Historique de vos parties", href: "/matches", icon: "🎮" },
  { id: "page-ai-coach", category: "pages", label: "AI Coach", description: "Analyse et conseils personnalisés", href: "/ai-coach", icon: "🤖" },
  { id: "page-objectifs", category: "pages", label: "Objectifs", description: "Suivez votre progression", href: "/goals", icon: "🎯" },
  { id: "page-classement", category: "pages", label: "Classement", description: "Comparez-vous aux autres", href: "/leaderboard", icon: "🏆" },
  { id: "page-predictions", category: "pages", label: "Prédictions", description: "Anticipez vos performances", href: "/prediction", icon: "🔮" },
  { id: "page-notifications", category: "pages", label: "Notifications", description: "Centre de notifications", href: "/notifications", icon: "🔔" },
  { id: "page-profil", category: "pages", label: "Profil", description: "Gérez votre compte", href: "/profile", icon: "👤" },
  { id: "page-parametres", category: "pages", label: "Paramètres", description: "Configuration de l'application", href: "/settings", icon: "⚙️" },
  { id: "page-comparaison", category: "pages", label: "Comparaison", description: "Comparez vos stats avec d'autres joueurs", href: "/compare", icon: "📈" },
];

export async function searchAll(userId: string, query: string, limit = 10): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const q = query.trim();

  const [players, matches, teams, notifications, goals] = await Promise.all([
    searchPlayers(userId, q, limit),
    searchMatches(userId, q, limit),
    searchTeams(userId, q, limit),
    searchNotifications(userId, q, limit),
    searchGoals(userId, q, limit),
  ]);

  const pages = searchPages(q, limit);

  const interleaved = interleaveResults(pages, players, matches, teams, notifications, goals);

  return interleaved.slice(0, limit);
}

function searchPages(query: string, limit: number): SearchResult[] {
  const lower = query.toLowerCase();
  return PAGE_ENTRIES
    .filter((p) =>
      p.label.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower)
    )
    .slice(0, limit);
}

async function searchPlayers(userId: string, query: string, limit: number): Promise<SearchResult[]> {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      id: { not: userId },
      visibility: "PUBLIC",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { publicSlug: { contains: query, mode: "insensitive" } },
        { riotAccount: { gameName: { contains: query, mode: "insensitive" } } },
      ],
    },
    take: limit,
    select: {
      id: true,
      name: true,
      publicSlug: true,
      riotAccount: { select: { gameName: true, tagLine: true, currentRank: true } },
    },
  });

  return users.map((u) => ({
    id: `player-${u.id}`,
    category: "joueurs" as const,
    label: u.name ?? u.publicSlug,
    description: u.riotAccount
      ? `${u.riotAccount.gameName}#${u.riotAccount.tagLine}`
      : "Compte non lié",
    href: `/compare?slug=${u.publicSlug}`,
    badge: u.riotAccount?.currentRank ?? undefined,
    icon: "👤",
  }));
}

async function searchMatches(userId: string, query: string, limit: number): Promise<SearchResult[]> {
  const matches = await prisma.playerMatchStats.findMany({
    where: {
      userId,
      OR: [
        { agentName: { contains: query, mode: "insensitive" } },
        { mapName: { contains: query, mode: "insensitive" } },
        { teamId: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { matchStartedAt: "desc" },
    take: limit,
    select: {
      id: true,
      result: true,
      agentName: true,
      mapName: true,
      matchStartedAt: true,
      kills: true,
      deaths: true,
      assists: true,
    },
  });

  return matches.map((m) => ({
    id: `match-${m.id}`,
    category: "matchs" as const,
    label: `${m.mapName} — ${m.agentName}`,
    description: `${m.result === "WIN" ? "Victoire" : "Défaite"} — ${m.kills}/${m.deaths}/${m.assists}`,
    href: `/matches#match-${m.id}`,
    badge: m.result === "WIN" ? "Victoire" : "Défaite",
    icon: m.result === "WIN" ? "✅" : "❌",
  }));
}

async function searchTeams(userId: string, query: string, limit: number): Promise<SearchResult[]> {
  const teamMatches = await prisma.playerMatchStats.groupBy({
    by: ["teamId"],
    where: {
      userId,
      teamId: { contains: query, mode: "insensitive" },
    },
    _count: { id: true },
    _max: { matchStartedAt: true },
    orderBy: { _max: { matchStartedAt: "desc" } },
    take: limit,
  });

  return teamMatches.map((t) => ({
    id: `team-${t.teamId}`,
    category: "equipes" as const,
    label: t.teamId,
    description: `${t._count.id} match${t._count.id > 1 ? "s" : ""} joué${t._count.id > 1 ? "s" : ""}`,
    href: `/matches?team=${encodeURIComponent(t.teamId)}`,
    icon: "🛡️",
  }));
}

async function searchNotifications(userId: string, query: string, limit: number): Promise<SearchResult[]> {
  const notifs = await prisma.notification.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { body: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, title: true, body: true, link: true, readAt: true },
  });

  return notifs.map((n) => ({
    id: `notif-${n.id}`,
    category: "notifications" as const,
    label: n.title,
    description: n.body ?? "",
    href: n.link ?? "/notifications",
    badge: n.readAt ? "Lue" : "Non lue",
    icon: "🔔",
  }));
}

async function searchGoals(userId: string, query: string, limit: number): Promise<SearchResult[]> {
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, title: true, description: true, status: true, currentValue: true, targetValue: true },
  });

  return goals.map((g) => ({
    id: `goal-${g.id}`,
    category: "objectifs" as const,
    label: g.title,
    description: g.description ?? `${g.currentValue}/${g.targetValue}`,
    href: `/goals#goal-${g.id}`,
    badge: g.status === "COMPLETED" ? "Terminé" : g.status === "IN_PROGRESS" ? "En cours" : "Non commencé",
    icon: "🎯",
  }));
}

function interleaveResults(...groups: SearchResult[][]): SearchResult[] {
  const maxLen = Math.max(...groups.map((g) => g.length));
  const result: SearchResult[] = [];

  for (let i = 0; i < maxLen; i++) {
    for (const group of groups) {
      if (i < group.length) {
        result.push(group[i]);
      }
    }
  }

  return result;
}
