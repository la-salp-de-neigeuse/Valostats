import { z } from "zod";
import { RiotPlatform } from "@prisma/client";

export const linkRiotAccountSchema = z.object({
  gameName: z
    .string()
    .min(3, "Le Riot ID doit faire au moins 3 caractères")
    .max(16, "Le Riot ID doit faire au maximum 16 caractères"),
  tagLine: z
    .string()
    .min(3, "Le Tagline doit faire au moins 3 caractères")
    .max(5, "Le Tagline doit faire au maximum 5 caractères"),
  platform: z.nativeEnum(RiotPlatform, {
    message: "Région invalide",
  }),
});

export type LinkRiotAccountInput = z.infer<typeof linkRiotAccountSchema>;
