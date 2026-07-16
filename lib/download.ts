/**
 * Migration vers lib/download/index.ts
 *
 * Ce fichier est conservé pour compatibilité. Utilisez:
 *   import { downloadService } from "@/lib/download";
 */
export { downloadService, DownloadService } from "./download/index";
export type { DownloadInfo, DownloadSource, DownloadSourceConfig } from "./download/types";
