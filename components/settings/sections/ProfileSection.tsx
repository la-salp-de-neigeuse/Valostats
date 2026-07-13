"use client";

import { useSettingSave } from "@/hooks/use-setting-save";
import type { UserProfileSettings } from "@/services/settings/types";
import { UserAvatar } from "@/components/ui/placeholder-avatar";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field-group";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const LOCALES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
];

const TIMEZONES = [
  "Europe/Paris", "Europe/London", "Europe/Berlin",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Asia/Tokyo", "Asia/Seoul", "Asia/Shanghai",
  "Asia/Singapore", "Australia/Sydney", "UTC",
];

interface ProfileSectionProps {
  initial: UserProfileSettings;
}

export function ProfileSection({ initial }: ProfileSectionProps) {
  const { data, setData, hasChanges, saving, save, error, success } = useSettingSave({
    endpoint: "/api/settings",
    initialData: initial,
    transformPayload: (d) => ({ profile: d }),
    successMessage: "Profil mis à jour.",
  });

  return (
    <Card padding="lg">
      <div className="space-y-2 mb-6">
        <h2 className="text-lg font-semibold text-text-primary">Profil</h2>
        <p className="text-sm text-text-muted">Modifiez vos informations personnelles.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-6">
        <div className="flex items-center gap-6">
            <UserAvatar name={data.name} size="3xl" />
          <div>
            <p className="text-sm font-medium text-text-secondary">Avatar</p>
            <p className="text-xs text-text-muted mt-1">Généré automatiquement à partir de votre pseudo.</p>
          </div>
        </div>

        <FieldGroup label="Pseudo">
          <Input value={data.name ?? ""} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="Votre pseudo" />
        </FieldGroup>

        <FieldGroup label="Riot ID">
          <div className="flex items-center gap-2 h-10 rounded-lg border border-border bg-surface px-3 text-sm text-text-muted">
            {initial.riotGameName ? (
              <span>{initial.riotGameName}#{initial.riotTagLine}</span>
            ) : (
              <span className="italic">Aucun compte Riot lié</span>
            )}
          </div>
        </FieldGroup>

        <FieldGroup label="Langue">
          <Select value={data.locale} onChange={(v) => setData({ ...data, locale: v })} options={LOCALES} />
        </FieldGroup>

        <FieldGroup label="Fuseau horaire">
          <Select value={data.timezone} onChange={(v) => setData({ ...data, timezone: v })} options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))} />
        </FieldGroup>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
        {success && !saving && <p className="text-sm text-emerald-400" role="status">Profil mis à jour.</p>}

        <Button type="submit" isLoading={saving} disabled={!hasChanges}>
          Enregistrer
        </Button>
      </form>
    </Card>
  );
}
