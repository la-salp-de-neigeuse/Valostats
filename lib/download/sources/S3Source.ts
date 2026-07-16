import { DownloadSource, DownloadSourceConfig, DownloadInfo } from "../types";

interface S3ManifestEntry {
  version: string;
  filename: string;
  size: number;
  checksum?: string;
  releaseNotes: string;
  publishedAt: string;
  platform: string;
  arch: string;
}

/**
 * Source de téléchargement S3 (compatible AWS S3, MinIO, etc.).
 *
 * Structure du bucket S3 attendue:
 * ```
 * /downloads/
 *   manifest.json        ← liste de toutes les versions disponibles
 *   ValoStats-Setup-1.0.0.exe
 *   ValoStats-Setup-1.0.1.exe
 *   ...
 * ```
 *
 * Le fichier manifest.json contient:
 * ```json
 * {
 *   "latest": "1.0.0",
 *   "versions": [
 *     { "version": "1.0.0", "filename": "ValoStats-Setup-1.0.0.exe", ... },
 *     { "version": "1.0.1", ... }
 *   ]
 * }
 * ```
 *
 * Configuration:
 * ```json
 * {
 *   "name": "s3",
 *   "baseUrl": "https://cdn.valostats.app",
 *   "manifestPath": "/downloads/manifest.json"
 * }
 * ```
 */
export class S3Source implements DownloadSource {
  readonly name = "s3";
  private baseUrl = "";
  private manifestPath = "/downloads/manifest.json";

  async init(config: DownloadSourceConfig): Promise<void> {
    this.baseUrl = String(config.baseUrl || "").replace(/\/+$/, "");
    this.manifestPath = String(config.manifestPath || "/downloads/manifest.json");
  }

  async getLatestDownload(): Promise<DownloadInfo> {
    const manifest = await this.fetchManifest();
    const latestVersion = manifest.latest;
    const entry = manifest.versions.find((v) => v.version === latestVersion);
    if (!entry) {
      throw new Error(
        `Version ${latestVersion} introuvable dans le manifest S3`
      );
    }
    return this.entryToDownloadInfo(entry);
  }

  async getDownloadForVersion(version: string): Promise<DownloadInfo> {
    const manifest = await this.fetchManifest();
    const entry = manifest.versions.find((v) => v.version === version);
    if (!entry) {
      throw new Error(`Version ${version} introuvable dans le manifest S3`);
    }
    return this.entryToDownloadInfo(entry);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchManifest();
      return true;
    } catch {
      return false;
    }
  }

  private async fetchManifest(): Promise<{
    latest: string;
    versions: S3ManifestEntry[];
  }> {
    const url = `${this.baseUrl}${this.manifestPath}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      throw new Error(
        `S3 manifest: ${res.status} ${res.statusText} — Vérifier l'URL ${url}`
      );
    }

    const manifest = await res.json();
    return manifest;
  }

  private entryToDownloadInfo(entry: S3ManifestEntry): DownloadInfo {
    return {
      version: entry.version,
      url: `${this.baseUrl}/downloads/${entry.filename}`,
      size: entry.size,
      releaseNotes: entry.releaseNotes || "",
      publishedAt: entry.publishedAt,
      filename: entry.filename,
      platform: entry.platform || "win32",
      arch: entry.arch || "x64",
      checksum: entry.checksum,
    };
  }
}
