import { prisma } from "@/lib/prisma/client";
import type { ProfileVisibility } from "@prisma/client";
import type { PrivacySettingsInput } from "@/lib/validation/settings";
import type { PrivacySettings } from "@/services/settings/types";
import { cacheDelete } from "@/lib/cache/cache-service";
import { settingsKey } from "@/lib/cache/keys";

export async function updatePrivacySettings(
  userId: string,
  input: PrivacySettingsInput,
): Promise<PrivacySettings> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      visibility: input.visibility as ProfileVisibility,
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
  });

  await cacheDelete(settingsKey(userId));

  return { ...input };
}
