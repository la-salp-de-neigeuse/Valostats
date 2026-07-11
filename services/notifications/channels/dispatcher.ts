import type { NotificationType, NotificationChannel } from "../types";

interface DispatchPayload {
  title: string;
  body?: string;
  metadata?: Record<string, unknown>;
}

const CHANNEL_HANDLERS: Record<NotificationChannel, (userId: string, payload: DispatchPayload) => Promise<void>> = {
  IN_APP: async () => {},
  EMAIL: async () => {
    // À implémenter : envoi d'email via Resend / SendGrid
  },
  DISCORD: async () => {
    // À implémenter : webhook Discord via URL stockée en base
  },
  PUSH: async () => {
    // À implémenter : push mobile via Firebase Cloud Messaging
  },
};

export async function dispatchChannel(
  userId: string,
  _type: NotificationType,
  payload: DispatchPayload,
): Promise<void> {
  void _type;
  const channels: NotificationChannel[] = ["IN_APP"];

  await Promise.allSettled(
    channels.map((ch) => CHANNEL_HANDLERS[ch](userId, payload)),
  );
}
