import { RiotRegionGroup } from "@prisma/client";
import { riotFetch } from "@/services/riot-api/api-client";

const REGION_GROUP_TO_API_ROUTING: Record<RiotRegionGroup, string> = {
  AMERICAS: "americas",
  ASIA: "asia",
  EUROPE: "europe",
  SEA: "asia",
};

export interface RiotMatchListDto {
  puuid: string;
  history: Array<{
    matchId: string;
    gameStartTime: number;
    teamId: string;
    queueId: string;
  }>;
}

export interface RiotMatchPlayerDto {
  subject: string;
  teamId: string;
  characterId: string;
  competitiveTier: number;
  stats: {
    score: number;
    roundsPlayed: number;
    kills: number;
    deaths: number;
    assists: number;
    playtimeMillis: number;
    abilityCasts: {
      grenadeCasts: number;
      ability1Casts: number;
      ability2Casts: number;
      ultimateCasts: number;
    } | null;
  };
  roundDamage: Array<{
    round: number;
    receiver: string;
    damage: number;
  }>;
  firstBloodCount?: number;
}

export interface RiotMatchTeamDto {
  teamId: string;
  won: boolean;
  roundsPlayed: number;
  roundsWon: number;
  numPoints: number;
}

export interface RiotMatchRoundResultDto {
  roundNum: number;
  roundResult: string;
  bombPlanter?: string;
  bombDefuser?: string;
}

export interface RiotMatchDto {
  matchInfo: {
    matchId: string;
    mapId: string;
    gamePodId: string;
    gameLoopState: string;
    gameServerAddress: string;
    gameVersion: string;
    gameLengthMillis: number;
    gameStartMillis: number;
    provisioningFlowID: string;
    isCompleted: boolean;
    customGameName: string;
    forcePostProcessing: boolean;
    queueID: string;
    gameMode: string;
    isRanked: boolean;
    isMatchSampled: boolean;
    seasonId: string;
    completionState: string;
    platformType: string;
    premierMatchInfo: Record<string, unknown>;
    partyRRPenalties: Record<string, unknown>;
    shouldMatchDisablePenalties: boolean;
  };
  players: RiotMatchPlayerDto[];
  teams: RiotMatchTeamDto[];
  roundResults: RiotMatchRoundResultDto[];
}

export async function getMatchIdsByPuuid(
  puuid: string,
  regionGroup: RiotRegionGroup,
  options: { size?: number; startIndex?: number } = {}
): Promise<string[]> {
  const routing = REGION_GROUP_TO_API_ROUTING[regionGroup];
  const { size = 20, startIndex = 0 } = options;

  const params = new URLSearchParams({
    size: size.toString(),
    startIndex: startIndex.toString(),
  });

  const data = (await riotFetch(
    `/val/match/v1/matchlists/by-puuid/${encodeURIComponent(puuid)}?${params.toString()}`,
    routing
  )) as RiotMatchListDto;

  return data.history.map((h) => h.matchId);
}

export async function getMatchDetails(
  matchId: string,
  regionGroup: RiotRegionGroup
): Promise<RiotMatchDto> {
  const routing = REGION_GROUP_TO_API_ROUTING[regionGroup];

  return (await riotFetch(
    `/val/match/v1/matches/${encodeURIComponent(matchId)}`,
    routing
  )) as RiotMatchDto;
}
