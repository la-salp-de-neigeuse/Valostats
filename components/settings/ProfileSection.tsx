"use client";

import { useState } from "react";
import type { UserProfileSettings } from "@/services/settings/types";

const LOCALES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
];

const TIMEZONES = [
  "Europe/Paris",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];

interface ProfileSectionProps {
  initial: UserProfileSettings;
}

export function ProfileSection({ initial }: ProfileSectionProps) {
  const [name, setName] = useState(initial.name ?? "");
  const [locale, setLocale] = useState(initial.locale);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: { name, locale, timezone },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde.");
      }

      setMessage({ type: "success", text: "Profil mis à jour." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur inattendue." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Profil" description="Modifiez vos informations personnelles.">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-500/20 shrink-0" role="img" aria-label={name || "Avatar"}>
            {(name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Avatar</p>
            <p className="text-xs text-slate-500 mt-1">Généré automatiquement à partir de votre pseudo.</p>
          </div>
        </div>

        <FieldGroup label="Pseudo">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
            placeholder="Votre pseudo"
          />
        </FieldGroup>

        <FieldGroup label="Riot ID">
          <div className="flex items-center gap-2 h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-slate-400">
            {initial.riotGameName ? (
              <span>{initial.riotGameName}#{initial.riotTagLine}</span>
            ) : (
              <span className="italic">Aucun compte Riot lié</span>
            )}
          </div>
        </FieldGroup>

        <FieldGroup label="Langue">
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
          >
            {LOCALES.map((l) => (
              <option key={l.value} value={l.value} className="bg-[#111115]">{l.label}</option>
            ))}
          </select>
        </FieldGroup>

        <FieldGroup label="Fuseau horaire">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz} className="bg-[#111115]">{tz}</option>
            ))}
          </select>
        </FieldGroup>

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

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
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
