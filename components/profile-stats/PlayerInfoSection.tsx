"use client";

import { useState } from "react";
import type { PlayerInfo } from "@/services/dashboard/player-info-service";

const PLAYER_CARD_BASE = "https://media.valorant-api.com/playercards";

function ProfileImage({ cardId }: { cardId: string | null }) {
  const [error, setError] = useState(false);

  if (!cardId || error) {
    return (
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center shrink-0 ring-2 ring-accent/20">
        <svg className="w-9 h-9 text-accent/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 22 22 2 22 12 2" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 ring-2 ring-accent/20 bg-surface-hover">
      <img
        src={`${PLAYER_CARD_BASE}/${cardId}/smallart.png`}
        alt=""
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

function formatLastSync(date: Date | null): string {
  if (!date) return "Non disponible";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

interface PlayerInfoSectionProps {
  data: PlayerInfo;
}

export function PlayerInfoSection({ data }: PlayerInfoSectionProps) {
  const riotId = data.gameName && data.tagLine
    ? `${data.gameName}#${data.tagLine}`
    : null;

  const rr = data.currentRankTier ?? null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d0d14] via-[#111118] to-[#0a0a0e] border border-border/80 p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-accent/[0.04] rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <ProfileImage cardId={data.currentPlayerCardId} />

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              {riotId ?? "Compte non lié"}
            </h2>
            {data.gameName && data.tagLine && (
              <p className="text-sm text-text-muted/70">
                {data.currentRank ?? "Non classé"}
                {rr !== null && ` — ${rr} RR`}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {data.regionGroup && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-hover text-text-muted text-xs font-medium border border-border/50">
                {data.regionGroup}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-hover text-text-muted text-xs font-medium border border-border/50">
              Niveau : Non disponible
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-hover text-text-muted text-xs font-medium border border-border/50">
              Dernière synchro : {formatLastSync(data.lastSyncAt)}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-hover/40 border border-border/50">
          <div className="text-right">
            <p className="text-xs text-text-muted leading-tight">Rang actuel</p>
            <p className="text-lg font-bold text-text-primary leading-tight">{data.currentRank ?? "Non classé"}</p>
            {rr !== null && <p className="text-xs text-text-muted/60 leading-tight">{rr} RR</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
