import { z } from "zod";
import { RiotPlatform } from "@prisma/client";

export const linkRiotAccountSchema = z.object({
  gameName: z
    .string()
    .min(1, "Le nom Riot ne peut pas être vide")
    .max(30, "Le nom Riot ne peut pas dépasser 30 caractères")
    .regex(
      /^[\p{L}\p{N}\s._\-'!@#$%^&*()+=[\]{}|\\:;"<>,?\/~`]+$/u,
      "Le nom Riot contient des caractères non valides"
    ),
  tagLine: z
    .string()
    .min(1, "Le Tagline ne peut pas être vide")
    .max(5, "Le Tagline doit faire au maximum 5 caractères")
    .regex(/^[a-zA-Z0-9]+$/, "Le Tagline ne peut contenir que des lettres et des chiffres"),
  platform: z.nativeEnum(RiotPlatform, {
    message: "Région invalide",
  }),
});

export type LinkRiotAccountInput = z.infer<typeof linkRiotAccountSchema>;
