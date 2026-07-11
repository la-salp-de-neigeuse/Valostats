import { ProfileVisibility } from "@prisma/client";
import { z } from "zod";

export const notificationChannelSettingsSchema = z.object({
  rankChange: z.boolean(),
  newRecord: z.boolean(),
  winStreak: z.boolean(),
  aiInsight: z.boolean(),
  goalCompleted: z.boolean(),
  badgeUnlocked: z.boolean(),
  scoreImprovement: z.boolean(),
  syncCompleted: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  email: notificationChannelSettingsSchema,
  discord: notificationChannelSettingsSchema,
  push: notificationChannelSettingsSchema,
});

export const aiSettingsSchema = z.object({
  provider: z.enum(["OPENAI", "CLAUDE", "GEMINI"]),
  model: z.string().min(1, "Le modèle est requis."),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(256).max(128000),
});

export const privacySettingsSchema = z.object({
  visibility: z.nativeEnum(ProfileVisibility),
  showRankPublicly: z.boolean(),
  showMatchHistory: z.boolean(),
  showAiScore: z.boolean(),
  allowLeaderboard: z.boolean(),
});

export const profileSettingsSchema = z.object({
  name: z.string().min(1, "Le pseudo est requis.").max(30),
  locale: z.string().min(2).max(10),
  timezone: z.string().min(1),
});

export const overlaySettingsSchema = z.object({
  theme: z.string().min(1),
  widgets: z.record(z.string(), z.boolean()),
});

export const updateSettingsSchema = z.object({
  profile: profileSettingsSchema.optional(),
  notifications: notificationSettingsSchema.optional(),
  ai: aiSettingsSchema.optional(),
  privacy: privacySettingsSchema.optional(),
  overlay: overlaySettingsSchema.optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type ProfileSettingsInput = z.infer<typeof profileSettingsSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type AiSettingsInput = z.infer<typeof aiSettingsSchema>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
export type OverlaySettingsInput = z.infer<typeof overlaySettingsSchema>;
