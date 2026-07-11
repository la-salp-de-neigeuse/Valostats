"use client";

import type { OverlayTheme, OverlaySettings } from "@/services/overlay/types";

const THEME_VARS: Record<OverlayTheme, Record<string, string>> = {
  dark: {
    "--ol-bg": "#09090b",
    "--ol-text": "#fafafa",
    "--ol-text-secondary": "#a1a1aa",
    "--ol-card": "#1c1c1f",
    "--ol-border": "#27272a",
    "--ol-win": "#22c55e",
    "--ol-loss": "#ef4444",
  },
  transparent: {
    "--ol-bg": "transparent",
    "--ol-text": "#ffffff",
    "--ol-text-secondary": "#a1a1aa",
    "--ol-card": "rgba(0,0,0,0.5)",
    "--ol-border": "rgba(255,255,255,0.1)",
    "--ol-win": "#22c55e",
    "--ol-loss": "#ef4444",
  },
  pink: {
    "--ol-bg": "#1a0a14",
    "--ol-text": "#fce7f3",
    "--ol-text-secondary": "#d946ef",
    "--ol-card": "#2d1b2e",
    "--ol-border": "#4a1d4a",
    "--ol-win": "#a78bfa",
    "--ol-loss": "#fb7185",
  },
  minimal: {
    "--ol-bg": "transparent",
    "--ol-text": "#fafafa",
    "--ol-text-secondary": "#a1a1aa",
    "--ol-card": "rgba(0,0,0,0.3)",
    "--ol-border": "rgba(255,255,255,0.15)",
    "--ol-win": "#22c55e",
    "--ol-loss": "#ef4444",
  },
  streamer: {
    "--ol-bg": "linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 50%, #0f0f1a 100%)",
    "--ol-text": "#fafafa",
    "--ol-text-secondary": "#a1a1aa",
    "--ol-card": "rgba(30, 15, 50, 0.7)",
    "--ol-border": "rgba(168, 85, 247, 0.25)",
    "--ol-win": "#22c55e",
    "--ol-loss": "#ef4444",
  },
  competition: {
    "--ol-bg": "#000000",
    "--ol-text": "#ffffff",
    "--ol-text-secondary": "#71717a",
    "--ol-card": "rgba(255,255,255,0.05)",
    "--ol-border": "rgba(255,255,255,0.08)",
    "--ol-win": "#22c55e",
    "--ol-loss": "#ef4444",
  },
};

const THEME_FONTS: Record<OverlayTheme, string> = {
  dark: "system-ui, sans-serif",
  transparent: "system-ui, sans-serif",
  pink: "system-ui, sans-serif",
  minimal: "system-ui, sans-serif",
  streamer: "'Geist Mono', monospace",
  competition: "'Geist Sans', sans-serif",
};

export function OverlayThemeProvider({ settings }: { settings: OverlaySettings }) {
  const themeVars = THEME_VARS[settings.theme] ?? THEME_VARS.dark;

  const userFont = settings.font === "geist-mono"
    ? "var(--font-geist-mono)"
    : settings.font === "monospace"
    ? "monospace"
    : settings.font === "inter"
    ? "'Inter', sans-serif"
    : "var(--font-geist-sans)";

  const fontV = settings.theme === "streamer" || settings.theme === "competition"
    ? THEME_FONTS[settings.theme]
    : userFont;

  const borderR = settings.borderRadius;
  const showB = settings.showBorder;

  return (
    <style>{`
      .overlay-root {
        ${Object.entries(themeVars)
          .map(([k, v]) => `${k}: ${v};`)
          .join("\n        ")}
        --ol-primary: ${settings.colors.primary};
        --ol-secondary: ${settings.colors.secondary};
        --ol-accent: ${settings.colors.accent};
        --ol-bg-user: ${settings.colors.background || "transparent"};
        --ol-text-user: ${settings.colors.text || "inherit"};
        --ol-opacity: ${String((100 - settings.transparency) / 100)};
        font-family: ${fontV};
        font-size: ${settings.fontScale}%;
      }
      .overlay-root .ol-card {
        background: ${settings.displayMode === "minimal" ? "transparent" : "var(--ol-card)"};
        border: ${showB ? "1px solid var(--ol-border)" : "none"};
        border-radius: ${borderR}px;
        padding: ${settings.size === "small" ? "8px 12px" : settings.size === "large" ? "16px 24px" : "12px 16px"};
        opacity: var(--ol-opacity);
        backdrop-filter: ${settings.theme === "transparent" || settings.theme === "streamer" ? "blur(8px)" : "none"};
      }
      .overlay-root .ol-text-primary { color: var(--ol-text-user, var(--ol-text)); }
      .overlay-root .ol-text-secondary { color: var(--ol-text-secondary); }
      .overlay-root .ol-text-win { color: var(--ol-win); }
      .overlay-root .ol-text-loss { color: var(--ol-loss); }
      .overlay-root .ol-text-accent { color: var(--ol-accent); }
      .overlay-root .ol-header {
        margin-bottom: ${settings.size === "small" ? "8px" : settings.size === "large" ? "16px" : "12px"};
      }
      .overlay-root .ol-title {
        font-size: ${settings.size === "small" ? "14px" : settings.size === "large" ? "22px" : "18px"};
        font-weight: 700;
      }
      .overlay-root .ol-label {
        font-size: ${settings.size === "small" ? "10px" : settings.size === "large" ? "14px" : "12px"};
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.7;
        margin-bottom: 2px;
      }
      .overlay-root .ol-value {
        font-size: ${settings.size === "small" ? "16px" : settings.size === "large" ? "28px" : "22px"};
        font-weight: 700;
      }
      .overlay-root .ol-value-sm {
        font-size: ${settings.size === "small" ? "12px" : settings.size === "large" ? "18px" : "14px"};
        font-weight: 600;
      }
      .overlay-root .ol-match-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
        font-size: ${settings.size === "small" ? "11px" : settings.size === "large" ? "15px" : "13px"};
      }
      .overlay-root .ol-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        padding: 1px 6px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .overlay-root .ol-badge-win {
        background: color-mix(in srgb, var(--ol-win) 20%, transparent);
        color: var(--ol-win);
      }
      .overlay-root .ol-badge-loss {
        background: color-mix(in srgb, var(--ol-loss) 20%, transparent);
        color: var(--ol-loss);
      }
      ${settings.animations ? `
        .overlay-root .ol-card {
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .overlay-root .ol-fade-in {
          animation: olFadeIn 0.5s ease forwards;
        }
        @keyframes olFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` : ""}
    `}</style>
  );
}
