import { DownloadSource, DownloadSourceConfig, DownloadInfo } from "../types";

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  assets: {
    name: string;
    size: number;
    browser_download_url: string;
    content_type: string;
  }[];
}

/**
 * Source de téléchargement GitHub Releases.
 *
 * Utilise l'API GitHub pour récupérer la dernière release
 * et ses assets. Ne nécessite pas de token pour les repos
 * publics, mais un token GH_PAT est recommandé pour éviter
 * les limites de rate limiting (60 req/h sans token, 5000 avec).
 *
 * Configuration:
 * ```json
 * {
 *   "name": "github",
 *   "owner": "votre-org",
 *   "repo": "valostats-companion",
 *   "token": "ghp_..." // optionnel, via GH_PAT env
 * }
 * ```
 */
export class GitHubSource implements DownloadSource {
  readonly name = "github";
  private owner = "";
  private repo = "";
  private token = "";

  async init(config: DownloadSourceConfig): Promise<void> {
    this.owner = String(config.owner || "");
    this.repo = String(config.repo || "");
    this.token = String(config.token || process.env.GH_PAT || "");
  }

  async getLatestDownload(): Promise<DownloadInfo> {
    const release = await this.fetchRelease("latest");
    return this.releaseToDownloadInfo(release);
  }

  async getDownloadForVersion(version: string): Promise<DownloadInfo> {
    const release = await this.fetchRelease(`tags/v${version}`);
    return this.releaseToDownloadInfo(release);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchRelease("latest");
      return true;
    } catch {
      return false;
    }
  }

  private async fetchRelease(identifier: string): Promise<GitHubRelease> {
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/${identifier}`;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "valostats-companion",
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    const res = await fetch(url, { headers, next: { revalidate: 300 } });

    if (!res.ok) {
      throw new Error(
        `GitHub API: ${res.status} ${res.statusText} — Vérifier que le dépôt ${this.owner}/${this.repo} existe et que la release "${identifier}" est publique.`
      );
    }

    return res.json();
  }

  private releaseToDownloadInfo(release: GitHubRelease): DownloadInfo {
    const winAsset =
      release.assets.find((a) => a.name.endsWith(".exe")) || release.assets[0];

    return {
      version: release.tag_name.replace(/^v/, ""),
      url: winAsset?.browser_download_url || "",
      size: winAsset?.size || 0,
      releaseNotes: release.body || "",
      publishedAt: release.published_at,
      filename: winAsset?.name || "",
      platform: "win32",
      arch: "x64",
    };
  }
}
