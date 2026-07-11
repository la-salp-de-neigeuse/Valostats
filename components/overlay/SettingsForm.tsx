"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type {
  OverlaySettings,
  OverlayTheme,
  OverlayDisplayMode,
  OverlayWidgetType,
} from "@/services/overlay/types";
import { WIDGET_LABELS } from "@/services/overlay/types";

const THEME_LABELS: Record<OverlayTheme, string> = {
  dark: "Dark",
  transparent: "Transparent",
  pink: "Pink",
  minimal: "Minimal",
  streamer: "Streamer",
  competition: "Competition",
};

const MODE_LABELS: Record<OverlayDisplayMode, string> = {
  normal: "Normal",
  streamer: "Streamer",
  competition: "Competition",
  minimal: "Minimal",
};

const ALL_WIDGET_TYPES: OverlayWidgetType[] = [
  "playerName", "rank", "rr", "winRate", "kda", "aiScore",
  "recentMatches", "lastMatch", "mainAgent", "bestAgent", "winStreak",
  "lastResult", "progression", "goalOfDay", "lastAiInsight", "syncTime",
];

const COLUMNS = 12;
const ROWS = 6;

export function SettingsForm({ initialSettings }: { initialSettings: OverlaySettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState<OverlaySettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragType, setDragType] = useState<OverlayWidgetType | null>(null);

  const update = useCallback(
    <K extends keyof OverlaySettings>(key: K, value: OverlaySettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSaved(false);
    },
    [],
  );

  const toggleWidget = useCallback((type: OverlayWidgetType) => {
    setSettings((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.type === type ? { ...w, visible: !w.visible } : w,
      ),
    }));
    setSaved(false);
  }, []);

  const moveWidget = useCallback(
    (type: OverlayWidgetType, x: number, y: number) => {
      setSettings((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) => {
          if (w.type !== type) return w;
          const clampedX = Math.max(0, Math.min(x, COLUMNS - w.w));
          const clampedY = Math.max(0, Math.min(y, ROWS - w.h));
          return { ...w, x: clampedX, y: clampedY };
        }),
      }));
      setSaved(false);
    },
    [],
  );

  const resizeWidget = useCallback(
    (type: OverlayWidgetType, dw: number, dh: number) => {
      setSettings((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) => {
          if (w.type !== type) return w;
          const newW = Math.max(1, Math.min(w.w + dw, COLUMNS - w.x));
          const newH = Math.max(1, Math.min(w.h + dh, ROWS - w.y));
          return { ...w, w: newW, h: newH };
        }),
      }));
      setSaved(false);
    },
    [],
  );

  const updateColor = useCallback((key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/overlay/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }, [settings, router]);

  const handleDragStart = (e: React.DragEvent, type: OverlayWidgetType) => {
    setDragType(type);
    e.dataTransfer.setData("text/plain", type);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, cellX: number, cellY: number) => {
    e.preventDefault();
    const draggedType = e.dataTransfer.getData("text/plain") as OverlayWidgetType;
    if (draggedType) moveWidget(draggedType, cellX, cellY);
    setDragType(null);
  };

  return (
    <div className="space-y-6">
      <Section label="Thème">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(THEME_LABELS) as OverlayTheme[]).map((t) => (
            <button
              key={t}
              onClick={() => update("theme", t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.theme === t
                  ? "bg-rose-500 text-white"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}
            >
              {THEME_LABELS[t]}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Mode d'affichage">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MODE_LABELS) as OverlayDisplayMode[]).map((m) => (
            <button
              key={m}
              onClick={() => update("displayMode", m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.displayMode === m
                  ? "bg-rose-500 text-white"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Widgets">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {ALL_WIDGET_TYPES.map((type) => {
            const widget = settings.widgets.find((w) => w.type === type);
            return (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer text-sm text-slate-300"
              >
                <input
                  type="checkbox"
                  checked={widget?.visible ?? false}
                  onChange={() => toggleWidget(type)}
                  className="accent-rose-500"
                />
                {WIDGET_LABELS[type]}
              </label>
            );
          })}
        </div>

        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-3">Glissez-déposez les widgets pour les positionner</p>
          <div
            className="relative"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 48px)`,
              gap: 4,
            }}
          >
            {Array.from({ length: COLUMNS * ROWS }).map((_, idx) => {
              const cellX = idx % COLUMNS;
              const cellY = Math.floor(idx / COLUMNS);
              return (
                <div
                  key={idx}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cellX, cellY)}
                  className="border border-dashed border-slate-700/30 rounded"
                  style={{ gridColumn: cellX + 1, gridRow: cellY + 1 }}
                />
              );
            })}
            {settings.widgets
              .filter((w) => w.visible)
              .map((widget) => (
                <div
                  key={widget.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.type)}
                  onDragEnd={() => setDragType(null)}
                  className={`relative flex items-center justify-center text-xs font-medium rounded-lg cursor-grab active:cursor-grabbing transition-all group ${
                    dragType === widget.type
                      ? "opacity-50 ring-2 ring-rose-500"
                      : "hover:ring-1 hover:ring-slate-500"
                  }`}
                  style={{
                    gridColumn: `${widget.x + 1} / span ${widget.w}`,
                    gridRow: `${widget.y + 1} / span ${widget.h}`,
                    background: settings.colors.primary + "20",
                    border: `1px solid ${settings.colors.primary}40`,
                    color: settings.colors.primary,
                  }}
                  title={`${WIDGET_LABELS[widget.type]} (${widget.w}x${widget.h})`}
                >
                  <span className="truncate px-1">{WIDGET_LABELS[widget.type]}</span>
                  <div className="absolute bottom-0.5 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); resizeWidget(widget.type, -1, 0); }}
                      className="w-3.5 h-3.5 flex items-center justify-center rounded bg-slate-700/80 text-[8px] text-white hover:bg-slate-600"
                      title="Rétrécir"
                    >−</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); resizeWidget(widget.type, 1, 0); }}
                      className="w-3.5 h-3.5 flex items-center justify-center rounded bg-slate-700/80 text-[8px] text-white hover:bg-slate-600"
                      title="Élargir"
                    >+</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Section>

      <Section label="Couleurs">
        <div className="grid grid-cols-5 gap-3">
          {(["primary", "secondary", "accent", "background", "text"] as const).map((k) => (
            <div key={k}>
              <label className="block text-xs text-slate-500 mb-1 capitalize">{k}</label>
              <input
                type="color"
                value={settings.colors[k]}
                onChange={(e) => updateColor(k, e.target.value)}
                className="w-full h-9 rounded-lg cursor-pointer bg-transparent border border-slate-700"
              />
            </div>
          ))}
        </div>
      </Section>

      <Section label="Taille">
        <div className="flex flex-wrap gap-2">
          {(["small", "medium", "large"] as const).map((s) => (
            <button
              key={s}
              onClick={() => update("size", s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.size === s
                  ? "bg-rose-500 text-white"
                  : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
              }`}
            >
              {s === "small" ? "Petite" : s === "medium" ? "Moyenne" : "Grande"}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Police">
        <select
          value={settings.font}
          onChange={(e) => update("font", e.target.value as OverlaySettings["font"])}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        >
          <option value="geist-sans">Geist Sans</option>
          <option value="geist-mono">Geist Mono</option>
          <option value="inter">Inter</option>
          <option value="monospace">Monospace</option>
        </select>
      </Section>

      <Section label="Échelle de la police">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={50}
            max={200}
            step={10}
            value={settings.fontScale}
            onChange={(e) => update("fontScale", Number(e.target.value))}
            className="flex-1 accent-rose-500"
          />
          <span className="text-xs text-slate-400 w-10 text-right">{settings.fontScale}%</span>
        </div>
      </Section>

      <Section label="Transparence">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={80}
            step={5}
            value={settings.transparency}
            onChange={(e) => update("transparency", Number(e.target.value))}
            className="flex-1 accent-rose-500"
          />
          <span className="text-xs text-slate-400 w-10 text-right">{settings.transparency}%</span>
        </div>
      </Section>

      <Section label="Bordure">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input
              type="checkbox"
              checked={settings.showBorder}
              onChange={(e) => update("showBorder", e.target.checked)}
              className="accent-rose-500"
            />
            Afficher les bordures
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Rayon:</span>
            <input
              type="range"
              min={0}
              max={24}
              step={2}
              value={settings.borderRadius}
              onChange={(e) => update("borderRadius", Number(e.target.value))}
              className="w-24 accent-rose-500"
            />
            <span className="text-xs text-slate-400">{settings.borderRadius}px</span>
          </div>
        </div>
      </Section>

      <Section label="Ombres">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
            <input
              type="checkbox"
              checked={settings.shadow}
              onChange={(e) => update("shadow", e.target.checked)}
              className="accent-rose-500"
            />
            Afficher les ombres
          </label>
          {settings.shadow && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Flou:</span>
              <input
                type="range"
                min={4}
                max={32}
                step={2}
                value={settings.shadowBlur}
                onChange={(e) => update("shadowBlur", Number(e.target.value))}
                className="w-24 accent-rose-500"
              />
              <span className="text-xs text-slate-400">{settings.shadowBlur}px</span>
            </div>
          )}
        </div>
      </Section>

      <Section label="Animations">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
          <input
            type="checkbox"
            checked={settings.animations}
            onChange={(e) => update("animations", e.target.checked)}
            className="accent-rose-500"
          />
          Activer les animations de transition
        </label>
      </Section>

      <Section label="Intervalle de rafraîchissement">
        <select
          value={settings.refreshInterval}
          onChange={(e) => update("refreshInterval", Number(e.target.value))}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        >
          <option value={10}>10 secondes</option>
          <option value={30}>30 secondes</option>
          <option value={60}>1 minute</option>
          <option value={120}>2 minutes</option>
          <option value={300}>5 minutes</option>
        </select>
      </Section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {saving ? "Enregistrement..." : saved ? "✓ Enregistré" : "Enregistrer"}
      </button>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        {label}
      </h3>
      {children}
    </div>
  );
}
