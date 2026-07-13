import { prisma } from "@/lib/prisma/client";

export interface ExtendedProfileData {
  image: string | null;
  bannerUrl: string | null;
  bio: string | null;
}

export interface ExtendedPrivacyData {
  showGoals: boolean;
  showRecentMatches: boolean;
}

export async function getExtendedProfileData(userId: string): Promise<ExtendedProfileData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true, bannerUrl: true, bio: true },
  });

  if (!user) throw new Error("Utilisateur introuvable.");

  return user;
}

export async function getExtendedPrivacyData(userId: string): Promise<ExtendedPrivacyData> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { showGoals: true, showRecentMatches: true },
  });

  return {
    showGoals: settings?.showGoals ?? false,
    showRecentMatches: settings?.showRecentMatches ?? false,
  };
}

export async function saveAvatar(userId: string, imageDataUrl: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { image: imageDataUrl },
  });
}

export async function deleteAvatar(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { image: null },
  });
}

export async function saveBanner(userId: string, bannerDataUrl: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { bannerUrl: bannerDataUrl },
  });
}

export async function deleteBanner(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { bannerUrl: null },
  });
}

export async function updateBio(userId: string, bio: string | null): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { bio },
  });
}

export async function updateExtendedPrivacy(
  userId: string,
  data: { showGoals?: boolean; showRecentMatches?: boolean }
): Promise<void> {
  await prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      showGoals: data.showGoals ?? false,
      showRecentMatches: data.showRecentMatches ?? false,
    },
    update: data,
  });
}
