import type { SocialPlatform } from "@prisma/client";
import { SocialIcon, getSocialColor } from "./SocialIcons";

interface SocialLinkItem {
  id: string;
  platform: SocialPlatform;
  url: string;
  visibility?: string;
}

interface SocialLinksDisplayProps {
  links: SocialLinkItem[];
  showVisibility?: boolean;
  size?: "sm" | "md";
}

const LABELS: Record<SocialPlatform, string> = {
  TWITCH: "Twitch",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  X: "X",
  DISCORD: "Discord",
  INSTAGRAM: "Instagram",
  KICK: "Kick",
};

const VISIBILITY_ICONS: Record<string, React.ReactNode> = {
  PUBLIC: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Public">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  CONNECTED_ONLY: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Connectés">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  HIDDEN: (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Masqué">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
};

const VISIBILITY_LABELS: Record<string, string> = {
  PUBLIC: "Public",
  CONNECTED_ONLY: "Connectés",
  HIDDEN: "Masqué",
};

export function SocialLinksDisplay({ links, showVisibility = false, size = "md" }: SocialLinksDisplayProps) {
  if (!links.length) return null;

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const gap = size === "sm" ? "gap-2" : "gap-3";

  return (
    <div className={`flex flex-wrap ${gap}`}>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center ${gap} px-3 py-1.5 rounded-lg bg-surface-hover/50 border border-border ${getSocialColor(link.platform)} transition-all hover:bg-surface-hover hover:border-border-hover group`}
          title={`${LABELS[link.platform]}${showVisibility && link.visibility ? ` · ${VISIBILITY_LABELS[link.visibility]}` : ""}`}
        >
          <SocialIcon platform={link.platform} className={iconSize} />
          <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors hidden sm:inline">
            {LABELS[link.platform]}
          </span>
          {showVisibility && link.visibility && (
            <span className="text-text-muted" title={VISIBILITY_LABELS[link.visibility]}>
              {VISIBILITY_ICONS[link.visibility]}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
