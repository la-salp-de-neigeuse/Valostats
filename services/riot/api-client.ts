export class RiotApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "RiotApiError";
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { RIOT_FETCH_TIMEOUT_MS, RIOT_RETRY_COUNT } from "@/constants/limits";

export async function riotFetch(
  url: string,
  region: string = "europe",
  retries = RIOT_RETRY_COUNT,
  attempt = 0,
): Promise<unknown> {
  const apiKey = process.env.RIOT_API_KEY;

  if (!apiKey) {
    throw new Error("RIOT_API_KEY non configurée côté serveur.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), RIOT_FETCH_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`https://${region}.api.riotgames.com${url}`, {
      headers: {
        "X-Riot-Token": apiKey,
      },
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new RiotApiError(0, "La requête vers l'API Riot a expiré.");
    }
    if (retries > 0 && attempt < 2) {
      const backoff = Math.min(1000 * 2 ** attempt + Math.random() * 1000, 8000);
      await sleep(backoff);
      return riotFetch(url, region, retries - 1, attempt + 1);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    if (response.status === 429 && retries > 0) {
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 2;
      const waitMs = Number.isNaN(retryAfterSeconds) ? 2000 : retryAfterSeconds * 1000;
      const jitter = Math.random() * 500;
      await sleep(waitMs + jitter);
      return riotFetch(url, region, retries - 1, attempt + 1);
    }

    if (response.status === 404) {
      throw new RiotApiError(404, "Ressource introuvable sur l'API Riot");
    }
    if (response.status === 429) {
      throw new RiotApiError(429, "Rate limit de l'API Riot dépassé");
    }
    if (response.status === 403) {
      throw new RiotApiError(403, "Clé API Riot invalide ou expirée");
    }
    throw new RiotApiError(response.status, `Erreur API Riot: ${response.statusText}`);
  }

  return response.json();
}
