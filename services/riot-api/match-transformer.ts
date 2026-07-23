import { MatchResult, RiotPlatform, RiotRegionGroup, ValorantQueue } from "@prisma/client";
import { competitiveTierToRank } from "@/lib/valorant/competitive-tiers";
import type { RiotMatchDto, RiotMatchPlayerDto, RiotMatchTeamDto } from "@/services/riot-api/match-api";

const QUEUE_ID_TO_ENUM: Record<string, ValorantQueue> = {
  competitive: "COMPETITIVE",
  unrated: "UNRATED",
  premier: "PREMIER",
  swiftplay: "SWIFTPLAY",
  spikerush: "SPIKERUSH",
  deathmatch: "DEATHMATCH",
};

function mapQueueId(queueId: string): ValorantQueue {
  const mapped = QUEUE_ID_TO_ENUM[queueId.toLowerCase()];
  return mapped ?? "UNRATED";
}

const MAP_ID_TO_NAME: Record<string, string> = {
  "/Game/Maps/Ascent/Ascent": "Ascent",
  "/Game/Maps/Duality/Duality": "Bind",
  "/Game/Maps/Foxtrot/Foxtrot": "Breeze",
  "/Game/Maps/Canyon/Canyon": "Fracture",
  "/Game/Maps/Triad/Triad": "Haven",
  "/Game/Maps/Port/Port": "Icebox",
  "/Game/Maps/Pitt/Pitt": "Pearl",
  "/Game/Maps/Jam/Jam": "Lotus",
  "/Game/Maps/Juliett/Juliett": "Sunset",
  "/Game/Maps/Infinity/Infinity": "Abyss",
  "/Game/Maps/HURM/HURM_Alley/HURM_Alley": "District",
  "/Game/Maps/HURM/HURM_Bowl/HURM_Bowl": "Kasbah",
  "/Game/Maps/HURM/HURM_Courtyard/HURM_Courtyard": "Piazza",
  "/Game/Maps/HURM/HURM_Port/HURM_Port": "Drift",
};

function mapIdToName(mapId: string): string {
  return MAP_ID_TO_NAME[mapId] ?? mapId;
}

function resolveResult(playerTeamId: string, teams: RiotMatchTeamDto[]): MatchResult {
  const team = teams.find((t) => t.teamId === playerTeamId);
  if (!team) return "DRAW";
  const opponentTeam = teams.find((t) => t.teamId !== playerTeamId);
  if (!opponentTeam) return "DRAW";
  if (team.roundsWon > opponentTeam.roundsWon) return "WIN";
  if (team.roundsWon < opponentTeam.roundsWon) return "LOSS";
  return "DRAW";
}

function calcDamagePerRound(player: RiotMatchPlayerDto): number {
  const totalDamage = player.roundDamage.reduce((sum, rd) => sum + rd.damage, 0);
  const rounds = player.stats.roundsPlayed || 1;
  return Math.round((totalDamage / rounds) * 100) / 100;
}

function calcHeadshotRate(player: RiotMatchPlayerDto): number {
  if (player.stats.headshots != null && player.stats.kills > 0) {
    return Math.round((player.stats.headshots / player.stats.kills) * 10_000) / 100;
  }
  return 0;
}

function calcCombatScore(player: RiotMatchPlayerDto): number {
  const rounds = player.stats.roundsPlayed || 1;
  return Math.round((player.stats.score / rounds) * 100) / 100;
}

function calcRoundStats(
  playerPuuid: string,
  roundResults: RiotMatchDto["roundResults"]
) {
  let plants = 0;
  let defuses = 0;
  const firstBloods = 0;

  for (const round of roundResults) {
    if (round.bombPlanter === playerPuuid) plants++;
    if (round.bombDefuser === playerPuuid) defuses++;
  }

  return { plants, defuses, firstBloods };
}

function calcAttackDefenseStats(
  playerPuuid: string,
  playerTeamId: string,
  teams: RiotMatchTeamDto[]
) {
  const team = teams.find((t) => t.teamId === playerTeamId);
  return {
    attackRoundsWon: team ? Math.floor(team.roundsWon / 2) : 0,
    attackRoundsPlayed: team ? Math.floor(team.roundsPlayed / 2) : 0,
    defenseRoundsWon: team ? Math.ceil(team.roundsWon / 2) : 0,
    defenseRoundsPlayed: team ? Math.ceil(team.roundsPlayed / 2) : 0,
  };
}

export interface TransformedMatch {
  match: {
    riotMatchId: string;
    platform: RiotPlatform;
    regionGroup: RiotRegionGroup;
    queue: ValorantQueue;
    mapId: string;
    mapName: string;
    gameStartedAt: Date;
    durationSeconds: number;
  };
  playerStatsByPuuid: Map<
    string,
    {
      matchStartedAt: Date;
      agentName: string;
      playerCardId: string | null;
      mapName: string;
      teamId: string;
      result: MatchResult;
      rankAtMatch: string | null;
      rankTierAtMatch: number | null;
      kills: number;
      deaths: number;
      assists: number;
      score: number;
      headshotRate: number;
      damagePerRound: number;
      combatScore: number;
      firstBloods: number;
      firstDeaths: number;
      openingDuelsTaken: number;
      openingDuelsWon: number;
      utilityCasts: number;
      plants: number;
      defuses: number;
      attackRoundsWon: number;
      attackRoundsPlayed: number;
      defenseRoundsWon: number;
      defenseRoundsPlayed: number;
      roundsPlayed: number;
    }
  >;
}

export function transformMatch(
  dto: RiotMatchDto,
  platform: RiotPlatform,
  regionGroup: RiotRegionGroup
): TransformedMatch {
  const mapId = dto.matchInfo.mapId;
  const mapName = mapIdToName(mapId);
  const queue = mapQueueId(dto.matchInfo.queueID);
  const gameStartedAt = new Date(dto.matchInfo.gameStartMillis);
  const durationSeconds = Math.round(dto.matchInfo.gameLengthMillis / 1000);

  const match = {
    riotMatchId: dto.matchInfo.matchId,
    platform,
    regionGroup,
    queue,
    mapId,
    mapName,
    gameStartedAt,
    durationSeconds,
  };

  const playerStatsByPuuid = new Map<string, TransformedMatch["playerStatsByPuuid"] extends Map<string, infer V> ? V : never>();

  for (const player of dto.players) {
    const { plants, defuses, firstBloods } = calcRoundStats(
      player.subject,
      dto.roundResults
    );
    const { attackRoundsWon, attackRoundsPlayed, defenseRoundsWon, defenseRoundsPlayed } =
      calcAttackDefenseStats(player.subject, player.teamId, dto.teams);

    const utilityCasts = player.stats.abilityCasts
      ? player.stats.abilityCasts.grenadeCasts +
        player.stats.abilityCasts.ability1Casts +
        player.stats.abilityCasts.ability2Casts +
        player.stats.abilityCasts.ultimateCasts
      : 0;

    playerStatsByPuuid.set(player.subject, {
      matchStartedAt: gameStartedAt,
      agentName: player.characterId,
      playerCardId: player.playerCard ?? null,
      mapName,
      teamId: player.teamId,
      result: resolveResult(player.teamId, dto.teams),
      rankAtMatch: competitiveTierToRank(player.competitiveTier),
      rankTierAtMatch: player.competitiveTier ?? null,
      kills: player.stats.kills,
      deaths: player.stats.deaths,
      assists: player.stats.assists,
      score: player.stats.score,
      headshotRate: calcHeadshotRate(player),
      damagePerRound: calcDamagePerRound(player),
      combatScore: calcCombatScore(player),
      firstBloods: player.firstBloodCount ?? firstBloods,
      firstDeaths: 0,
      openingDuelsTaken: 0,
      openingDuelsWon: 0,
      utilityCasts,
      plants,
      defuses,
      attackRoundsWon,
      attackRoundsPlayed,
      defenseRoundsWon,
      defenseRoundsPlayed,
      roundsPlayed: player.stats.roundsPlayed,
    });
  }

  return { match, playerStatsByPuuid };
}
