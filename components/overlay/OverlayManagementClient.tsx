"use client";

import { useState } from "react";
import type { OverlaySettings } from "@/services/overlay/types";
import type { OverlayPresetListItem } from "@/services/overlay/overlay-preset-service";
import { SettingsForm } from "@/components/overlay/SettingsForm";
import { PresetsPageClient } from "@/components/overlay/presets/PresetsPageClient";

interface OverlayManagementClientProps {
  initialSettings: OverlaySettings;
  initialPresets: OverlayPresetListItem[];
  userSlug: string;
  obsUrl: string;
  plan: string;
}

export function OverlayManagementClient({
  initialSettings,
  initialPresets,
  obsUrl,
  plan,
}: OverlayManagementClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(obsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("Copiez cette URL :", obsUrl);
    }
  };

  const presetLimit = plan === "PRO" || plan === "TEAM" ? 10 : 3;

  return (
    <>
      {/* URL navigateur */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
          URL navigateur
        </h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-secondary break-all">
            {obsUrl}
          </code>
          <button
            onClick={handleCopyUrl}
            className="shrink-0 px-3 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            {copied ? "✓ Copié" : "Copier"}
          </button>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Ajoutez cette URL comme source navigateur dans OBS Studio ou TikTok LIVE Studio (1920x1080 recommandé, fond transparent).
        </p>
      </div>

      {/* Presets */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
              Mes presets
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {initialPresets.length}/{presetLimit} utilisés
            </p>
          </div>
        </div>
        <PresetsPageClient initialPresets={initialPresets} compact />
      </div>

      {/* Configuration */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
          Configuration
        </h2>
        <SettingsForm initialSettings={initialSettings} />
      </div>
    </>
  );
}
