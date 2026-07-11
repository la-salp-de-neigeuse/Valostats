import { ProfileVisibility } from "@prisma/client";
import { z } from "zod";

import { displayNameSchema } from "@/lib/validation/auth";

export const updateProfileSchema = z.object({
  name: displayNameSchema,
});

export const updatePrivacySchema = z.object({
  visibility: z.nativeEnum(ProfileVisibility),
  showRankPublicly: z.boolean().default(false),
  showMatchHistory: z.boolean().default(false),
  showAiScore: z.boolean().default(false),
  allowLeaderboard: z.boolean().default(false),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Le mot de passe est requis."),
  confirmation: z.literal("SUPPRIMER", {
    message: "Tape SUPPRIMER pour confirmer.",
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
