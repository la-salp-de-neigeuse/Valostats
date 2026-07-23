"use client";

import { useState } from "react";
import { getAgentUuid } from "@/lib/valorant/agents";

export interface PlayerInfoCardData {
  gameName: string | null;
  tagLine: string | null;
  currentRank: string | null;
  currentRankTier: number | null;
  currentPlayerCardId: string | null;
  mainAgentDisplayName: string | null;
  mainAgentMatchCount: number;
}

interface PlayerInfoCardProps {
  data: PlayerInfoCardData;
}

const PLAYER_CARD_BASE = "https://media.valorant-api.com/playercards";
const AGENT_ICON_BASE = "https://media.valorant-api.com/agents";

function ProfileImage({ cardId }: { cardId: string | null }) {
  const [error, setError] = useState(false);

  if (!cardId || error) {
    return (
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center shrink-0 ring-2 ring-accent/20">
        <svg className="w-7 h-7 text-accent/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 22 22 2 22 12 2" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-accent/20 bg-surface-hover">
      <img
        src={`${PLAYER_CARD_BASE}/${cardId}/smallart.png`}
        alt=""
        className="w-full h-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}

function AgentIcon({ uuid, name }: { uuid: string; name: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center">
        <span className="text-xs font-bold text-text-muted">{name[0]}</span>
      </div>
    );
  }

  return (
    <img
      src={`${AGENT_ICON_BASE}/${uuid}/displayicon.png`}
      alt={name}
      className="w-9 h-9 rounded-lg"
      onError={() => setError(true)}
    />
  );
}

export function PlayerInfoCard({ data }: PlayerInfoCardProps) {
  const riotId = data.gameName && data.tagLine
    ? `${data.gameName}#${data.tagLine}`
    : null;

  const rankLabel = data.currentRank ?? "Non classé";
  const rr = data.currentRankTier ?? null;
  const agentUuid = data.mainAgentDisplayName
    ? getAgentUuid(data.mainAgentDisplayName)
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d0d14] via-[#111118] to-[#0a0a0e] border border-border/80 p-5 sm:p-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-accent/[0.04] rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="relative flex items-center gap-5">
        <ProfileImage cardId={data.currentPlayerCardId} />

        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-text-primary truncate">
            {riotId ?? "Compte Riot"}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-xs font-medium border border-accent/25">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 22 22 2 22 12 2" />
              </svg>
              {rankLabel}
            </span>
            {rr !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-hover text-text-muted text-xs font-medium border border-border/50">
                {rr} RR
              </span>
            )}
          </div>
        </div>

        {agentUuid && data.mainAgentDisplayName && (
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-surface-hover/40 border border-border/50">
            <AgentIcon uuid={agentUuid} name={data.mainAgentDisplayName} />
            <div className="text-right">
              <p className="text-xs text-text-muted leading-tight">Agent principal</p>
              <p className="text-sm font-semibold text-text-primary leading-tight">{data.mainAgentDisplayName}</p>
              <p className="text-[11px] text-text-muted/60 leading-tight">{data.mainAgentMatchCount} matchs</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
