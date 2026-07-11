import { prisma } from "@/lib/prisma/client";
import { RiotAccount, RiotPlatform, RiotRegionGroup } from "@prisma/client";

export type SafeRiotAccount = Pick<
  RiotAccount,
  | "id"
  | "gameName"
  | "tagLine"
  | "platform"
  | "regionGroup"
  | "currentRank"
  | "currentRankTier"
  | "connectedAt"
  | "lastSyncAt"
  | "isVerified"
  | "verifiedAt"
>;

function toSafeRiotAccount(account: RiotAccount): SafeRiotAccount {
  return {
    id: account.id,
    gameName: account.gameName,
    tagLine: account.tagLine,
    platform: account.platform,
    regionGroup: account.regionGroup,
    currentRank: account.currentRank,
    currentRankTier: account.currentRankTier,
    connectedAt: account.connectedAt,
    lastSyncAt: account.lastSyncAt,
    isVerified: account.isVerified,
    verifiedAt: account.verifiedAt,
  };
}

export async function getRiotAccountByUserId(userId: string): Promise<SafeRiotAccount | null> {
  const account = await prisma.riotAccount.findUnique({
    where: { userId },
  });

  if (!account) return null;
  return toSafeRiotAccount(account);
}

export async function isRiotAccountConnected(userId: string): Promise<boolean> {
  const account = await prisma.riotAccount.findUnique({
    where: { userId },
    select: { id: true },
  });
  
  return account !== null;
}

const PLATFORM_TO_REGION_GROUP: Record<RiotPlatform, RiotRegionGroup> = {
  BR1: "AMERICAS",
  EUN1: "EUROPE",
  EUW1: "EUROPE",
  JP1: "ASIA",
  KR: "ASIA",
  LA1: "AMERICAS",
  LA2: "AMERICAS",
  NA1: "AMERICAS",
  OC1: "SEA",
  TR1: "EUROPE",
};

export async function linkRiotAccount(
  userId: string,
  input: { gameName: string; tagLine: string; platform: RiotPlatform }
): Promise<SafeRiotAccount> {
  const regionGroup = PLATFORM_TO_REGION_GROUP[input.platform];
  
  const fakePuuid = crypto.randomUUID();

  const account = await prisma.riotAccount.upsert({
    where: { userId },
    update: {
      gameName: input.gameName,
      tagLine: input.tagLine,
      platform: input.platform,
      regionGroup,
    },
    create: {
      userId,
      riotPuuid: fakePuuid,
      gameName: input.gameName,
      tagLine: input.tagLine,
      platform: input.platform,
      regionGroup,
      currentRank: "Non Classé",
      currentRankTier: 0,
      isVerified: false,
    },
  });

  return toSafeRiotAccount(account);
}

import { getAccountByRiotId } from "@/services/riot-api/account-api";

export async function unlinkRiotAccount(userId: string): Promise<void> {
  const account = await prisma.riotAccount.findUnique({ where: { userId } });

  if (!account) {
    throw new Error("Aucun compte Riot lié");
  }

  await prisma.riotAccount.delete({ where: { userId } });
}

export async function verifyRiotAccount(userId: string): Promise<SafeRiotAccount> {
  const account = await prisma.riotAccount.findUnique({ where: { userId } });
  
  if (!account) {
    throw new Error("Aucun compte Riot lié à vérifier");
  }

  if (account.isVerified) {
    return toSafeRiotAccount(account);
  }

  const riotApiAccount = await getAccountByRiotId(
    account.gameName,
    account.tagLine,
    account.regionGroup
  );

  if (!riotApiAccount) {
    throw new Error("Riot ID introuvable sur l'API Riot. Veuillez vérifier l'orthographe.");
  }

  const updatedAccount = await prisma.riotAccount.update({
    where: { userId },
    data: {
      riotPuuid: riotApiAccount.puuid,
      gameName: riotApiAccount.gameName,
      tagLine: riotApiAccount.tagLine,
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  return toSafeRiotAccount(updatedAccount);
}
