import { debug } from "@/lib/debug";
import { RIOT_FETCH_TIMEOUT_MS, RIOT_RETRY_COUNT } from "@/constants/limits";

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

export async function riotFetch(
  url: string,
  region: string = "europe",
  retries = RIOT_RETRY_COUNT,
  attempt = 0,
): Promise<unknown> {
  const apiKey = process.env.RIOT_API_KEY;

  if (!apiKey) {
    console.error("[Riot API] RIOT_API_KEY non configurée");
    throw new RiotApiError(500, "Clé API Riot non configurée sur le serveur.");
  }

  const startTime = performance.now();
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
      console.warn(`[Riot API] Timeout après ${RIOT_FETCH_TIMEOUT_MS}ms — ${region} ${url.split("?")[0]}`);
      throw new RiotApiError(0, "La requête vers l'API Riot a expiré.");
    }
    if (retries > 0 && attempt < 2) {
      const backoff = Math.min(1000 * 2 ** attempt + Math.random() * 1000, 8000);
      console.warn(`[Riot API] Erreur réseau, new tentative dans ${Math.round(backoff)}ms (tentative ${attempt + 1}) — ${region}`);
      await sleep(backoff);
      return riotFetch(url, region, retries - 1, attempt + 1);
    }
    console.error(`[Riot API] Erreur réseau après ${attempt + 1} tentatives — ${region} ${url.split("?")[0]}`);
    throw new RiotApiError(0, "Impossible de contacter l'API Riot. Vérifiez votre connexion réseau.");
  } finally {
    clearTimeout(timeoutId);
  }

  const elapsedMs = Math.round(performance.now() - startTime);

  if (!response.ok) {
    if (response.status === 429 && retries > 0) {
      const retryAfterHeader = response.headers.get("Retry-After");
      const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 2;
      const waitMs = Number.isNaN(retryAfterSeconds) ? 2000 : retryAfterSeconds * 1000;
      const jitter = Math.random() * 500;
      console.warn(`[Riot API] 429 Rate limit — ${region} — retry dans ${Math.round(waitMs + jitter)}ms`);
      await sleep(waitMs + jitter);
      return riotFetch(url, region, retries - 1, attempt + 1);
    }

    const path = url.split("?")[0];
    if (response.status === 401 || response.status === 403) {
      console.error(`[Riot API] ${response.status} Clé API invalide ou expirée — ${region}${path}`);
      throw new RiotApiError(response.status, "Clé API Riot invalide ou expirée");
    }
    if (response.status === 404) {
      console.warn(`[Riot API] 404 — ${region}${path} (${elapsedMs}ms)`);
      throw new RiotApiError(404, "Ressource introuvable sur l'API Riot");
    }
    if (response.status === 429) {
      console.warn(`[Riot API] 429 Rate limit dépassé — ${region} (${elapsedMs}ms)`);
      throw new RiotApiError(429, "Rate limit de l'API Riot dépassé");
    }
    console.error(`[Riot API] ${response.status} — ${region}${path} (${elapsedMs}ms) — ${response.statusText}`);
    throw new RiotApiError(response.status, `Erreur API Riot: ${response.statusText}`);
  }

  debug(`[Riot API] 200 — ${region} ${url.split("?")[0]} (${elapsedMs}ms)`);
  return response.json();
}
