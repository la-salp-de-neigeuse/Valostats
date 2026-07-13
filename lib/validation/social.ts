import { SocialPlatform, SocialLinkVisibility } from "@prisma/client";
import { z } from "zod";

export const createSocialLinkSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().url("L'URL doit être valide.").max(500, "L'URL est trop longue."),
  visibility: z.nativeEnum(SocialLinkVisibility).default("PUBLIC"),
});

export const updateSocialLinkSchema = z.object({
  platform: z.nativeEnum(SocialPlatform).optional(),
  url: z.string().url("L'URL doit être valide.").max(500, "L'URL est trop longue.").optional(),
  visibility: z.nativeEnum(SocialLinkVisibility).optional(),
  displayOrder: z.number().int().optional(),
});

export type CreateSocialLinkInput = z.infer<typeof createSocialLinkSchema>;
export type UpdateSocialLinkInput = z.infer<typeof updateSocialLinkSchema>;
