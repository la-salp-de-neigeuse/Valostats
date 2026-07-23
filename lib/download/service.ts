import { DownloadSource, DownloadInfo } from "./types";
import { GitHubSource } from "./sources/GitHubSource";
import { S3Source } from "./sources/S3Source";
import { LocalSource } from "./sources/LocalSource";

/**
 * Tente de lire la version depuis valostats-companion/package.json.
 * Utile comme ultime fallback quand aucune source n'est disponible.
 */
function readCompanionVersion(): string | null {
  try {
    const { readFileSync, existsSync } = require("fs");
    const { join } = require("path");
    const pkgPath = join(process.cwd(), "..", "valostats-companion", "package.json");
    if (!existsSync(pkgPath)) return null;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return pkg.version || null;
  } catch {
    return null;
  }
}

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
    // 0. DOWNLOAD_URL prime sur tout — permet de définir une URL directe
    if (process.env.DOWNLOAD_URL) {
      return this.createUrlSource();
    }

    // 1. Essayer GitHub en premier si configuré
    if (process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
      try {
        const source = new GitHubSource();
        await source.init({
          name: "github",
          owner: process.env.GITHUB_OWNER,
          repo: process.env.GITHUB_REPO,
          token: process.env.GH_PAT || "",
        });
        const healthy = await source.healthCheck();
        if (healthy) return source;
      } catch {
        // GitHub indisponible → fallback
      }
    }

    // 2. Source S3
    if (process.env.DOWNLOAD_SOURCE === "s3" || process.env.S3_BASE_URL) {
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
      fallbackVersion: readCompanionVersion() || undefined,
    });
    return source;
  }

  private createUrlSource(): DownloadSource {
    const url = process.env.DOWNLOAD_URL!;
    const filename = process.env.DOWNLOAD_FILENAME || url.split("/").pop() || "";
    const version = process.env.DOWNLOAD_VERSION || readCompanionVersion() || "";
    const size = parseInt(process.env.DOWNLOAD_SIZE || "86000000", 10);

    return {
      name: "url",
      async init() {},
      async getLatestDownload() {
        return {
          version,
          url,
          size,
          releaseNotes: process.env.DOWNLOAD_RELEASE_NOTES || "",
          publishedAt: new Date().toISOString(),
          filename,
          platform: "win32",
          arch: "x64",
        };
      },
      async getDownloadForVersion() {
        return this.getLatestDownload();
      },
      async healthCheck() {
        return true;
      },
    };
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
          fallbackVersion: readCompanionVersion() || undefined,
        });
        return source;
      }
    }
  }
}
