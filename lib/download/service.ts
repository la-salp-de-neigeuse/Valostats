import { DownloadSource, DownloadInfo, DownloadSourceConfig } from "./types";
import { GitHubSource } from "./sources/GitHubSource";
import { S3Source } from "./sources/S3Source";
import { LocalSource } from "./sources/LocalSource";

/**
 * DownloadService
 *
 * Singleton central qui sélectionne automatiquement la source
 * de téléchargement active et fournit une API unifiée.
 *
 * Ordre de sélection de la source:
 *   1. Variables d'environnement (DOWNLOAD_SOURCE, GITHUB_OWNER, etc.)
 *   2. Fichier de configuration download.config.json à la racine
 *   3. Fallback vers la source locale (public/downloads/)
 *
 * Usage côté serveur:
 *   import { downloadService } from "@/lib/download";
 *   const info = await downloadService.getLatestDownload();
 *
 * Changement de source (ex: de local vers GitHub Releases):
 *   Dans le .env:
 *     DOWNLOAD_SOURCE=github
 *     GITHUB_OWNER=valostats
 *     GITHUB_REPO=valostats-companion
 *
 * Aucune modification du frontend nécessaire.
 */
export class DownloadService {
  private source: DownloadSource | null = null;
  private initialized = false;

  async ensureInit(): Promise<void> {
    if (this.initialized) return;
    this.source = await this.selectSource();
    this.initialized = true;
  }

  async getLatestDownload(): Promise<DownloadInfo> {
    await this.ensureInit();
    return this.source!.getLatestDownload();
  }

  async getDownloadForVersion(version: string): Promise<DownloadInfo> {
    await this.ensureInit();
    return this.source!.getDownloadForVersion(version);
  }

  async getDownloadUrl(): Promise<string> {
    const info = await this.getLatestDownload();
    return info.url;
  }

  async getVersion(): Promise<string> {
    const info = await this.getLatestDownload();
    return info.version;
  }

  async healthCheck(): Promise<{
    ok: boolean;
    source: string;
    error?: string;
  }> {
    try {
      await this.ensureInit();
      const ok = await this.source!.healthCheck();
      return { ok, source: this.source!.name };
    } catch (err) {
      return {
        ok: false,
        source: this.source?.name || "none",
        error: String(err),
      };
    }
  }

  private async selectSource(): Promise<DownloadSource> {
    const envSource = process.env.DOWNLOAD_SOURCE;

    // 1. Source GitHub
    if (envSource === "github" || process.env.GITHUB_OWNER) {
      const source = new GitHubSource();
      await source.init({
        name: "github",
        owner: process.env.GITHUB_OWNER || "",
        repo: process.env.GITHUB_REPO || "valostats-companion",
        token: process.env.GH_PAT || "",
      });
      return source;
    }

    // 2. Source S3
    if (envSource === "s3" || process.env.S3_BASE_URL) {
      const source = new S3Source();
      await source.init({
        name: "s3",
        baseUrl: process.env.S3_BASE_URL || "",
        manifestPath: process.env.S3_MANIFEST_PATH || "/downloads/manifest.json",
      });
      return source;
    }

    // 3. Fichier de configuration local
    try {
      const { readFileSync, existsSync } = await import("fs");
      const { join } = await import("path");
      const configPath = join(process.cwd(), "download.config.json");
      if (existsSync(configPath)) {
        const config = JSON.parse(readFileSync(configPath, "utf-8"));
        return await this.sourceFromConfig(config);
      }
    } catch {
      // fallback
    }

    // 4. Fallback: source locale
    const source = new LocalSource();
    await source.init({
      name: "local",
      downloadsDir: process.env.LOCAL_DOWNLOADS_DIR || "public/downloads",
    });
    return source;
  }

  private async sourceFromConfig(config: Record<string, unknown>): Promise<DownloadSource> {
    const type = String(config.type || "local");

    switch (type) {
      case "github": {
        const source = new GitHubSource();
        await source.init({
          name: "github",
          owner: String(config.owner || ""),
          repo: String(config.repo || "valostats-companion"),
          token: String(config.token || ""),
        });
        return source;
      }
      case "s3": {
        const source = new S3Source();
        await source.init({
          name: "s3",
          baseUrl: String(config.baseUrl || ""),
          manifestPath: String(config.manifestPath || "/downloads/manifest.json"),
        });
        return source;
      }
      default: {
        const source = new LocalSource();
        await source.init({
          name: "local",
          downloadsDir: String(config.downloadsDir || "public/downloads"),
        });
        return source;
      }
    }
  }
}
