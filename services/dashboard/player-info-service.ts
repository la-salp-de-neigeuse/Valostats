import { prisma } from "@/lib/prisma/client";
import { getRiotAccountByUserId } from "@/services/riot-account/riot-account-service";
import { formatAgentName } from "@/lib/valorant/agents";

export interface PlayerInfo {
  gameName: string | null;
  tagLine: string | null;
  currentRank: string | null;
  currentRankTier: number | null;
  currentPlayerCardId: string | null;
  regionGroup: string | null;
  lastSyncAt: Date | null;
  mainAgentName: string | null;
  mainAgentDisplayName: string | null;
  mainAgentMatchCount: number;
}

export async function getPlayerInfo(userId: string): Promise<PlayerInfo | null> {
  const account = await getRiotAccountByUserId(userId);
  if (!account) return null;

  const topAgent = await prisma.playerMatchStats.groupBy({
    by: ["agentName"],
    where: { userId },
    _count: true,
    orderBy: { _count: { agentName: "desc" } },
    take: 1,
  });

  const agentName = topAgent[0]?.agentName ?? null;

  return {
    gameName: account.gameName,
    tagLine: account.tagLine,
    currentRank: account.currentRank,
    currentRankTier: account.currentRankTier,
    currentPlayerCardId: account.currentPlayerCardId,
    regionGroup: account.regionGroup,
    lastSyncAt: account.lastSyncAt,
    mainAgentName: agentName,
    mainAgentDisplayName: agentName ? formatAgentName(agentName) : null,
    mainAgentMatchCount: topAgent[0]?._count ?? 0,
  };
}
