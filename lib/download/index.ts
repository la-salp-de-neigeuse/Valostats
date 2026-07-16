import { DownloadService } from "./service";

export type { DownloadInfo, DownloadSource, DownloadSourceConfig } from "./types";

export { DownloadService } from "./service";
export { GitHubSource } from "./sources/GitHubSource";
export { S3Source } from "./sources/S3Source";
export { LocalSource } from "./sources/LocalSource";

/**
 * Instance singleton du service de téléchargement.
 *
 * Usage:
 *   import { downloadService } from "@/lib/download";
 *   const info = await downloadService.getLatestDownload();
 */
export const downloadService = new DownloadService();
