import { cacheGet, cacheSet } from "@/lib/cache/cache-service";
import type { DataSource } from "@/lib/cache/cache-service";
import { TTL } from "@/lib/cache/keys";
import { redisGet, redisSet } from "@/lib/redis/client";
import type { NewsArticle } from "./types";

const NEWS_CACHE_KEY = "cache:news:articles";
const NEWS_FALLBACK_KEY = "cache:news:fallback";
const NEWS_PAGE = "https://playvalorant.com/fr-fr/news/";
const BUILD_ID_RE = /\/_next\/static\/([^/]+)\/_buildManifest\.js/;
const ORIGIN = "https://playvalorant.com";
const FALLBACK_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const FALLBACK_IMAGE = "https://cmsassets.content.gg/b89e2e1e-2c4c-4d5c-8a2a-2b4a6b7c8d9e/Valorant_Logo_V.png";

let memoryCache: { articles: NewsArticle[]; expiresAt: number } | null = null;
const MEMORY_TTL_MS = 30 * 60 * 1000;

function extractBuildId(html: string): string | null {
  const match = html.match(BUILD_ID_RE);
  return match ? match[1] : null;
}

function toAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("//")) return `https:${path}`;
  return `${ORIGIN}${path}`;
}

function parseArticles(payload: unknown): NewsArticle[] {
  try {
    const root = payload as Record<string, unknown>;
    const pageProps = root.pageProps as Record<string, unknown> | undefined;
    const page = pageProps?.page as Record<string, unknown> | undefined;
    const blades = page?.blades as unknown[] | undefined;
    if (!blades) return [];

    const articleGrid = blades.find((b) => {
      const blade = b as Record<string, unknown>;
      return blade.type === "articleCardGrid";
    }) as Record<string, unknown> | undefined;
    if (!articleGrid) return [];

    const items = articleGrid.items as Record<string, unknown>[] | undefined;
    if (!items) return [];

    return items.map((item) => {
      const action = item.action as Record<string, unknown> | undefined;
      const actionPayload = action?.payload as Record<string, unknown> | undefined;
      const rawUrl = (actionPayload?.url as string) ?? "";
      const url = toAbsoluteUrl(rawUrl);

      const title = (item.title as string) ?? "";
      if (!title) return null;

      const media = item.media as Record<string, unknown> | undefined;
      const rawImageUrl = (media?.url as string) ?? "";
      const imageUrl = rawImageUrl ? toAbsoluteUrl(rawImageUrl) : "";

      const category = item.category as Record<string, unknown> | undefined;
      const catName = (category?.title as string) ?? "";

      const descriptionBlock = item.description as Record<string, unknown> | undefined;
      const description = (descriptionBlock?.body as string) ?? null;

      const publishedAt = (item.publishedAt as string) ?? "";
      const tagList = (item.tags as { title?: string }[] | undefined) ?? [];

      const id = url || title;
      const tags = tagList.map((t) => t.title ?? "").filter(Boolean);

      return {
        id,
        title,
        description,
        imageUrl: imageUrl || FALLBACK_IMAGE,
        url,
        publishedAt,
        category: catName,
        tags,
        source: "riot" as DataSource,
      };
    }).filter(Boolean) as NewsArticle[];
  } catch (err) {
    console.warn("[News] parseArticles error:", err);
    return [];
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "ValoStats/1.0" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.warn("[News] fetchHtml error:", err);
    return null;
  }
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "ValoStats/1.0" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[News] fetchJson error:", err);
    return null;
  }
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
  if (memoryCache && Date.now() < memoryCache.expiresAt) {
    return memoryCache.articles;
  }

  const cached = await cacheGet<NewsArticle[]>(NEWS_CACHE_KEY);
  if (cached) {
    memoryCache = { articles: cached, expiresAt: Date.now() + MEMORY_TTL_MS };
    return cached;
  }

  const articles = await fetchNewsArticles();
  if (articles.length > 0) {
    await cacheSet(NEWS_CACHE_KEY, articles, TTL.NEWS);
    await redisSet(NEWS_FALLBACK_KEY, JSON.stringify(articles), FALLBACK_TTL_MS);
    memoryCache = { articles, expiresAt: Date.now() + MEMORY_TTL_MS };
    return articles;
  }

  const fallbackRaw = await redisGet(NEWS_FALLBACK_KEY);
  if (fallbackRaw) {
    try {
      const fallback = JSON.parse(fallbackRaw) as NewsArticle[];
      if (fallback.length > 0) {
        memoryCache = { articles: fallback, expiresAt: Date.now() + 60_000 };
        return fallback;
      }
    } catch {}
  }

  return [];
}

async function fetchNewsArticles(): Promise<NewsArticle[]> {
  const html = await fetchHtml(NEWS_PAGE);
  if (!html) return [];

  const buildId = extractBuildId(html);
  if (!buildId) {
    console.warn("[News] buildId not found in playvalorant.com HTML");
    return [];
  }

  const dataUrl = `https://playvalorant.com/_next/data/${buildId}/fr-fr/news.json`;
  const payload = await fetchJson(dataUrl);
  if (!payload) return [];

  return parseArticles(payload);
}
