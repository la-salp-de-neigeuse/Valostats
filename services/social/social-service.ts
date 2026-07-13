import { prisma } from "@/lib/prisma/client";
import type { SocialPlatform, SocialLinkVisibility } from "@prisma/client";
import type { CreateSocialLinkInput, UpdateSocialLinkInput } from "@/lib/validation/social";

export interface SocialLinkData {
  id: string;
  platform: SocialPlatform;
  url: string;
  visibility: SocialLinkVisibility;
  displayOrder: number;
}

export async function getUserSocialLinks(userId: string): Promise<SocialLinkData[]> {
  const links = await prisma.socialLink.findMany({
    where: { userId },
    orderBy: { displayOrder: "asc" },
    select: { id: true, platform: true, url: true, visibility: true, displayOrder: true },
  });
  return links;
}

export async function getSocialLinksForProfile(
  ownerId: string,
  viewerId?: string
): Promise<SocialLinkData[]> {
  const isOwner = viewerId === ownerId;
  const isLoggedIn = !!viewerId;

  const links = await prisma.socialLink.findMany({
    where: {
      userId: ownerId,
      visibility: isOwner ? undefined : isLoggedIn ? { in: ["PUBLIC", "CONNECTED_ONLY"] } : "PUBLIC",
    },
    orderBy: { displayOrder: "asc" },
    select: { id: true, platform: true, url: true, visibility: true, displayOrder: true },
  });

  return links;
}

export async function createSocialLink(userId: string, input: CreateSocialLinkInput): Promise<SocialLinkData> {
  const existing = await prisma.socialLink.findUnique({
    where: { userId_platform: { userId, platform: input.platform } },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Vous avez déjà ajouté ce réseau social.");
  }

  const lastLink = await prisma.socialLink.findFirst({
    where: { userId },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });

  const link = await prisma.socialLink.create({
    data: {
      userId,
      platform: input.platform,
      url: input.url,
      visibility: input.visibility,
      displayOrder: (lastLink?.displayOrder ?? -1) + 1,
    },
    select: { id: true, platform: true, url: true, visibility: true, displayOrder: true },
  });

  return link;
}

export async function updateSocialLink(
  linkId: string,
  userId: string,
  input: UpdateSocialLinkInput
): Promise<SocialLinkData> {
  const link = await prisma.socialLink.findUnique({
    where: { id: linkId },
    select: { userId: true },
  });

  if (!link || link.userId !== userId) {
    throw new Error("Lien introuvable.");
  }

  if (input.platform && input.platform !== undefined) {
    const existing = await prisma.socialLink.findUnique({
      where: { userId_platform: { userId, platform: input.platform } },
      select: { id: true },
    });
    if (existing && existing.id !== linkId) {
      throw new Error("Vous avez déjà ajouté ce réseau social.");
    }
  }

  const updated = await prisma.socialLink.update({
    where: { id: linkId },
    data: {
      ...(input.platform !== undefined && { platform: input.platform }),
      ...(input.url !== undefined && { url: input.url }),
      ...(input.visibility !== undefined && { visibility: input.visibility }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
    },
    select: { id: true, platform: true, url: true, visibility: true, displayOrder: true },
  });

  return updated;
}

export async function deleteSocialLink(linkId: string, userId: string): Promise<void> {
  const link = await prisma.socialLink.findUnique({
    where: { id: linkId },
    select: { userId: true },
  });

  if (!link || link.userId !== userId) {
    throw new Error("Lien introuvable.");
  }

  await prisma.socialLink.delete({ where: { id: linkId } });
}
