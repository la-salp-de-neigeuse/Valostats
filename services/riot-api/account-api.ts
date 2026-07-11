import { RiotRegionGroup } from "@prisma/client";
import { riotFetch, RiotApiError } from "@/services/riot-api/api-client";

const REGION_GROUP_TO_API_ROUTING: Record<RiotRegionGroup, string> = {
  AMERICAS: "americas",
  ASIA: "asia",
  EUROPE: "europe",
  SEA: "asia",
};

export interface RiotAccountDto {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export async function getAccountByRiotId(
  gameName: string,
  tagLine: string,
  regionGroup: RiotRegionGroup = "EUROPE"
): Promise<RiotAccountDto | null> {
  const routing = REGION_GROUP_TO_API_ROUTING[regionGroup];
  
  try {
    const data = await riotFetch(
      `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      routing
    );
    return data as RiotAccountDto;
  } catch (error) {
    if (error instanceof RiotApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
