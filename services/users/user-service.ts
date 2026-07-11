import { prisma } from "@/lib/prisma/client";
import { createPublicSlug, normalizeEmail } from "@/lib/security/slug";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { ACCOUNT_LOCKOUT_THRESHOLD, ACCOUNT_LOCKOUT_DURATION_MIN } from "@/constants/limits";
import type { User, UserSettings } from "@prisma/client";
import type { RegisterInput, LoginInput } from "@/lib/validation/auth";
import type { UpdatePrivacyInput, UpdateProfileInput, DeleteAccountInput } from "@/lib/validation/user";

export type SafeUser = Pick<User,
  | "id" | "name" | "email" | "role" | "plan"
  | "visibility" | "publicSlug" | "privacyVersion"
  | "sessionVersion" | "createdAt" | "deletedAt"
>;

export type UserProfile = SafeUser & {
  settings: {
    showRankPublicly: boolean;
    showMatchHistory: boolean;
    showAiScore: boolean;
    allowLeaderboard: boolean;
    marketingEmails: boolean;
    productEmails: boolean;
  };
};

export function toSafeUser(user: User): SafeUser {
  const { name, email, role, plan, visibility, publicSlug, privacyVersion, sessionVersion, createdAt, deletedAt } = user;
  return { id: user.id, name, email, role, plan, visibility, publicSlug, privacyVersion, sessionVersion, createdAt, deletedAt };
}

export function toUserProfile(user: User & { settings: UserSettings | null }): UserProfile {
  return {
    ...toSafeUser(user),
    settings: {
      showRankPublicly: user.settings?.showRankPublicly ?? false,
      showMatchHistory: user.settings?.showMatchHistory ?? false,
      showAiScore: user.settings?.showAiScore ?? false,
      allowLeaderboard: user.settings?.allowLeaderboard ?? false,
      marketingEmails: user.settings?.marketingEmails ?? false,
      productEmails: user.settings?.productEmails ?? true,
    },
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true },
  });

  if (!user) return null;

  return toUserProfile(user);
}

export async function registerUser(input: RegisterInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);
  const publicSlug = createPublicSlug(input.name || "player");

  const user = await prisma.user.create({
    data: {
      name: input.name || null,
      email: input.email,
      normalizedEmail,
      password: { create: { passwordHash } },
      publicSlug,
      settings: { create: {} },
    },
    include: { settings: true },
  });

  return toUserProfile(user);
}

export async function authenticateUser(input: LoginInput) {
  const normalizedEmail = normalizeEmail(input.email);

  const user = await prisma.user.findUnique({
    where: { normalizedEmail },
    include: { password: true, settings: true },
  });

  if (!user || !user.password) return null;

  if (user.deletedAt) return null;

  if (user.password.lockedUntil && user.password.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil((user.password.lockedUntil.getTime() - Date.now()) / 60000);
    throw new Error(`Compte temporairement verrouillé. Réessayez dans ${remainingMinutes} minute(s).`);
  }

  const valid = await verifyPassword(user.password.passwordHash, input.password);
  if (!valid) {
    const newAttempts = user.password.failedAttempts + 1;
    const updates: { failedAttempts: number; lockedUntil?: Date } = { failedAttempts: newAttempts };

    if (newAttempts >= ACCOUNT_LOCKOUT_THRESHOLD) {
      updates.lockedUntil = new Date(Date.now() + ACCOUNT_LOCKOUT_DURATION_MIN * 60 * 1000);
    }

    await prisma.passwordCredential.update({
      where: { userId: user.id },
      data: updates,
    });
    return null;
  }

  await prisma.passwordCredential.update({
    where: { userId: user.id },
    data: { failedAttempts: 0, lockedUntil: null },
  });

  return toUserProfile(user);
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  const publicSlug = createPublicSlug(input.name);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: input.name, publicSlug, privacyVersion: { increment: 1 } },
    include: { settings: true },
  });

  return toUserProfile(user);
}

export async function updateUserPrivacy(userId: string, input: UpdatePrivacyInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      visibility: input.visibility,
      privacyVersion: { increment: 1 },
      settings: {
        upsert: {
          create: {
            showRankPublicly: input.showRankPublicly,
            showMatchHistory: input.showMatchHistory,
            showAiScore: input.showAiScore,
            allowLeaderboard: input.allowLeaderboard,
          },
          update: {
            showRankPublicly: input.showRankPublicly,
            showMatchHistory: input.showMatchHistory,
            showAiScore: input.showAiScore,
            allowLeaderboard: input.allowLeaderboard,
          },
        },
      },
    },
    include: { settings: true },
  });

  return toUserProfile(user);
}

export async function deleteUserAccount(userId: string, input: DeleteAccountInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { password: true },
  });

  if (!user || !user.password) {
    throw new Error("Utilisateur introuvable.");
  }

  const valid = await verifyPassword(user.password.passwordHash, input.password);
  if (!valid) {
    throw new Error("Mot de passe incorrect.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      email: `deleted-${Date.now()}@${user.id}.valostats.app`,
      normalizedEmail: `deleted-${Date.now()}@${user.id}.valostats.app`,
      sessionVersion: { increment: 1 },
    },
  });
}

export async function getUserBySlug(slug: string) {
  const user = await prisma.user.findUnique({
    where: { publicSlug: slug },
    select: {
      id: true,
      name: true,
      publicSlug: true,
      riotAccount: {
        select: {
          gameName: true,
          tagLine: true,
          currentRank: true,
          currentRankTier: true,
        },
      },
    },
  });

  return user;
}

export async function searchPlayers(query: string, limit = 10) {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      visibility: "PUBLIC",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { riotAccount: { gameName: { contains: query, mode: "insensitive" } } },
        { publicSlug: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      publicSlug: true,
      name: true,
      riotAccount: {
        select: {
          gameName: true,
          tagLine: true,
          currentRank: true,
        },
      },
    },
    take: limit,
    orderBy: { lastSeenAt: "desc" },
  });

  return users.map((u) => ({
    publicSlug: u.publicSlug,
    displayName: u.name ?? u.riotAccount?.gameName ?? u.publicSlug,
    gameName: u.riotAccount?.gameName ?? null,
    tagLine: u.riotAccount?.tagLine ?? null,
    rank: u.riotAccount?.currentRank ?? null,
  }));
}
