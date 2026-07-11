import { z } from "zod";

const passwordRequirements = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caracteres.")
  .max(128, "Le mot de passe est trop long.")
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule.")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule.")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre.")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir un symbole.");

export const emailSchema = z
  .string()
  .trim()
  .email("Adresse email invalide.")
  .max(254, "Adresse email trop longue.")
  .transform((email) => email.toLowerCase());

export const displayNameSchema = z
  .string()
  .trim()
  .min(3, "Le pseudo doit contenir au moins 3 caracteres.")
  .max(24, "Le pseudo doit contenir au maximum 24 caracteres.")
  .regex(
    /^[A-Za-z0-9_-]+$/,
    "Le pseudo peut contenir uniquement lettres, chiffres, tirets et underscores.",
  );

export const registerSchema = z.object({
  email: emailSchema,
  name: displayNameSchema,
  password: passwordRequirements,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis.").max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
