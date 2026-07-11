"use client";

import { useState } from "react";
import type { AiSettings } from "@/services/settings/types";
import { AI_MODEL_OPTIONS } from "@/services/settings/types";

interface AiSectionProps {
  initial: AiSettings;
}

export function AiSection({ initial }: AiSectionProps) {
  const [provider, setProvider] = useState(initial.provider);
  const [model, setModel] = useState(initial.model);
  const [temperature, setTemperature] = useState(initial.temperature);
  const [maxTokens, setMaxTokens] = useState(initial.maxTokens);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const availableModels = AI_MODEL_OPTIONS[provider] ?? [];

  function handleProviderChange(newProvider: string) {
    setProvider(newProvider as AiSettings["provider"]);
    const models = AI_MODEL_OPTIONS[newProvider as keyof typeof AI_MODEL_OPTIONS] ?? [];
    if (models.length > 0 && !models.includes(model)) {
      setModel(models[0]);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai: { provider, model, temperature, maxTokens } }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la sauvegarde.");
      }

      setMessage({ type: "success", text: "Configuration IA mise à jour." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur inattendue." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Intelligence Artificielle" description="Configurez le fournisseur et le modèle IA pour vos analyses.">
      <form onSubmit={handleSave} className="space-y-6">
        <FieldGroup label="Fournisseur">
          <div className="flex gap-2">
            {(["OPENAI", "CLAUDE", "GEMINI"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleProviderChange(p)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  provider === p
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700 hover:border-slate-600"
                }`}
              >
                {p === "OPENAI" ? "OpenAI" : p === "CLAUDE" ? "Claude" : "Gemini"}
              </button>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Modèle">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full h-10 rounded-lg border border-slate-700 bg-slate-800/50 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50"
          >
            {availableModels.map((m) => (
              <option key={m} value={m} className="bg-[#111115]">{m}</option>
            ))}
          </select>
        </FieldGroup>

        <FieldGroup label={`Température (${temperature.toFixed(1)})`}>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>Précis (0)</span>
            <span>Créatif (2)</span>
          </div>
        </FieldGroup>

        <FieldGroup label={`Tokens max (${maxTokens})`}>
          <input
            type="range"
            min={256}
            max={128000}
            step={256}
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
            className="w-full accent-rose-500"
          />
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
    <div className="space-y-2">
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
