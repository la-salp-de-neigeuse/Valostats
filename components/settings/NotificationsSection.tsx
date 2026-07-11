"use client";

import { useState } from "react";
import type { NotificationSettings, NotificationChannelSettings } from "@/services/settings/types";

const CHANNELS = [
  { key: "email", label: "Email", icon: EmailIcon },
  { key: "discord", label: "Discord", icon: DiscordIcon },
  { key: "push", label: "Push", icon: PushIcon },
];

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

function EmailIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M7.5 7.5c3.5-1 5.5-1 9 0" />
      <path d="M7.5 16.5c3.5 1 5.5 1 9 0" />
      <path d="M5.5 5.5C9 4 10.5 3.5 12 3.5s3 0.5 6.5 2" />
      <path d="M5.5 18.5C9 20 10.5 20.5 12 20.5s3-0.5 6.5-2" />
    </svg>
  );
}

function PushIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

interface NotificationsSectionProps {
  initial: NotificationSettings;
}

export function NotificationsSection({ initial }: NotificationsSectionProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function toggle(channel: keyof NotificationSettings, event: keyof NotificationChannelSettings) {
    setSettings((prev) => ({
      ...prev,
      [channel]: { ...prev[channel], [event]: !prev[channel][event] },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: settings }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde.");
      }

      setMessage({ type: "success", text: "Préférences de notification mises à jour." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur inattendue." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Notifications" description="Choisissez les événements pour lesquels vous souhaitez être notifié et sur quels canaux.">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 pr-4 text-slate-400 font-medium">Événement</th>
                {CHANNELS.map(({ key, label, icon: Icon }) => (
                  <th key={key} className="text-center py-3 px-3 text-slate-400 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon />
                      {label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Object.keys(EVENT_LABELS) as Array<keyof NotificationChannelSettings>).map((event) => (
                <tr key={event} className="border-b border-slate-800/50 last:border-0">
                  <td className="py-3 pr-4 text-slate-300">{EVENT_LABELS[event]}</td>
                  {CHANNELS.map(({ key }) => (
                    <td key={key} className="text-center py-3 px-3">
                      <input
                        type="checkbox"
                        checked={settings[key as keyof NotificationSettings][event]}
                        onChange={() => toggle(key as keyof NotificationSettings, event)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-rose-500 focus:ring-rose-500/30 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-emerald-400" : "text-rose-400"}`} role="alert">
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
        >
          {saving && (
            <svg aria-hidden="true" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Enregistrer
        </button>
      </form>
    </Section>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111115] border border-slate-800 rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
