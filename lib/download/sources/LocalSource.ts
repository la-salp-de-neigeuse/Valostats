import { DownloadSource, DownloadSourceConfig, DownloadInfo } from "../types";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * Source de téléchargement locale (développement / fallback).
 *
 * Utilise les fichiers présents dans le dossier public/downloads/.
 * En développement, les fichiers sont servis par Next.js.
 *
 * Structure attendue dans public/downloads/:
 * ```
 * public/downloads/
 *   latest.json          ← métadonnées de la dernière version
 *   ValoStats-Setup-1.0.0.exe
 * ```
 *
 * Format du fichier latest.json:
 * ```json
 * {
 *   "version": "1.0.0",
 *   "filename": "ValoStats-Setup-1.0.0.exe",
 *   "releaseNotes": "Version initiale",
 *   "publishedAt": "2026-07-15T00:00:00Z"
 * }
 * ```
 *
 * Configuration:
 * ```json
 * {
 *   "name": "local",
 *   "downloadsDir": "public/downloads"
 * }
 * ```
 */
export class LocalSource implements DownloadSource {
  readonly name = "local";
  private downloadsDir = "public/downloads";
  private baseUrl = "/downloads";
  private fallbackVersion = "";

  async init(config: DownloadSourceConfig): Promise<void> {
    this.downloadsDir = String(config.downloadsDir || "public/downloads");
    this.baseUrl = String(config.baseUrl || "/downloads");
    this.fallbackVersion = String(config.fallbackVersion || "");
  }

  async getLatestDownload(): Promise<DownloadInfo> {
    const manifest = this.readManifest();

    if (manifest) {
      const size = this.getFileSize(manifest.filename);
      if (size > 0) {
        return {
          version: manifest.version,
          url: `${this.baseUrl}/${manifest.filename}`,
          size,
          releaseNotes: manifest.releaseNotes || "",
          publishedAt: manifest.publishedAt || new Date().toISOString(),
          filename: manifest.filename,
          platform: "win32",
          arch: "x64",
        };
      }
      // manifest exists but file is missing → fall through to placeholder
    }

    const scanned = this.fallbackToDirectoryScan();
    if (scanned.size > 0) return scanned;

    // Ultime fallback : utiliser la version du package.json companion
    if (this.fallbackVersion) {
      return {
        version: this.fallbackVersion,
        url: "",
        size: 0,
        releaseNotes: "",
        publishedAt: new Date().toISOString(),
        filename: `ValoStats-Setup-${this.fallbackVersion}.exe`,
        platform: "win32",
        arch: "x64",
      };
    }

    throw new Error("Aucun fichier de téléchargement trouvé. Déployez un fichier .exe ou un manifeste latest.json dans public/downloads/.");
  }

  async getDownloadForVersion(version: string): Promise<DownloadInfo> {
    const filename = `ValoStats-Setup-${version}.exe`;
    const fullPath = join(process.cwd(), this.downloadsDir, filename);

    if (!existsSync(fullPath)) {
      throw new Error(
        `Version ${version} introuvable: ${filename} n'existe pas dans ${this.downloadsDir}`
      );
    }

    return {
      version,
      url: `${this.baseUrl}/${filename}`,
      size: statSync(fullPath).size,
      releaseNotes: "",
      publishedAt: new Date().toISOString(),
      filename,
      platform: "win32",
      arch: "x64",
    };
  }

  async healthCheck(): Promise<boolean> {
    const dir = join(process.cwd(), this.downloadsDir);
    return existsSync(dir);
  }

  private readManifest(): {
    version: string;
    filename: string;
    releaseNotes?: string;
    publishedAt?: string;
  } | null {
    try {
      const manifestPath = join(process.cwd(), this.downloadsDir, "latest.json");
      if (!existsSync(manifestPath)) return null;
      const content = readFileSync(manifestPath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  private getFileSize(filename: string): number {
    try {
      const fullPath = join(process.cwd(), this.downloadsDir, filename);
      if (!existsSync(fullPath)) return 0;
      return statSync(fullPath).size;
    } catch {
      return 0;
    }
  }

  private fallbackToDirectoryScan(): DownloadInfo {
    const dir = join(process.cwd(), this.downloadsDir);
    let latestExe: { name: string; mtime: Date; size: number } | null = null;

    try {
      if (!existsSync(dir)) {
        throw new Error(`Le répertoire ${dir} n'existe pas.`);
      }
      const files = readdirSync(dir);
      for (const file of files) {
        if (!file.endsWith(".exe")) continue;
        const stat = statSync(join(dir, file));
        if (!latestExe || stat.mtime > latestExe.mtime) {
          latestExe = { name: file, mtime: stat.mtime, size: stat.size };
        }
      }
    } catch {
      // fallback
    }

    if (!latestExe) {
      throw new Error("Aucun fichier .exe trouvé dans le répertoire de téléchargement.");
    }

    const versionMatch = latestExe.name.match(/[\d]+\.[\d]+\.[\d]+/);
    return {
      version: versionMatch ? versionMatch[0] : "0.0.0",
      url: `${this.baseUrl}/${latestExe.name}`,
      size: latestExe.size,
      releaseNotes: "",
      publishedAt: latestExe.mtime.toISOString(),
      filename: latestExe.name,
      platform: "win32",
      arch: "x64",
    };
  }

}
