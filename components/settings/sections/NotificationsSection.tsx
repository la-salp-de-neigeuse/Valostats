"use client";

import type { NotificationSettings, NotificationChannelSettings } from "@/services/settings/types";
import { useSettingSave } from "@/hooks/use-setting-save";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CHANNELS = [
  { key: "email", label: "Email" },
  { key: "discord", label: "Discord" },
  { key: "push", label: "Push" },
] as const;

const EVENT_LABELS: Record<keyof NotificationChannelSettings, string> = {
  rankChange: "Changement de rang",
  newRecord: "Nouveau record",
  winStreak: "Série de victoires",
  aiInsight: "Analyse IA disponible",
  goalCompleted: "Objectif atteint",
  badgeUnlocked: "Badge débloqué",
  scoreImprovement: "Amélioration du score",
  syncCompleted: "Synchronisation terminée",
};

interface NotificationsSectionProps {
  initial: NotificationSettings;
}

export function NotificationsSection({ initial }: NotificationsSectionProps) {
  const { data, setData, hasChanges, saving, save, error, success } = useSettingSave({
    endpoint: "/api/settings",
    initialData: initial,
    transformPayload: (d) => ({ notifications: d }),
    successMessage: "Préférences de notification mises à jour.",
  });

  function toggle(channel: keyof NotificationSettings, event: keyof NotificationChannelSettings) {
    setData({
      ...data,
      [channel]: { ...data[channel], [event]: !data[channel][event] },
    });
  }

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Notifications</h2>
        <p className="text-sm text-text-muted">Choisissez les événements pour lesquels vous souhaitez être notifié et sur quels canaux.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 text-text-muted font-medium">Événement</th>
                {CHANNELS.map(({ key, label }) => (
                  <th key={key} className="text-center py-3 px-3 text-text-muted font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(EVENT_LABELS) as Array<keyof NotificationChannelSettings>).map((event) => (
                <tr key={event} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4 text-text-secondary">{EVENT_LABELS[event]}</td>
                  {CHANNELS.map(({ key }) => (
                    <td key={key} className="text-center py-3 px-3">
                      <input
                        type="checkbox"
                        checked={data[key as keyof NotificationSettings][event]}
                        onChange={() => toggle(key as keyof NotificationSettings, event)}
                        className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent/30 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        {success && !saving && <p className="text-sm text-emerald-400" role="status">Préférences mises à jour.</p>}

        <Button type="submit" isLoading={saving} disabled={!hasChanges}>
          Enregistrer
        </Button>
      </form>
    </Card>
  );
}
