export interface DownloadInfo {
  /** Version semver (ex: "1.0.0") */
  version: string;
  /** URL directe de téléchargement */
  url: string;
  /** Taille du fichier en bytes */
  size: number;
  /** Notes de version en markdown */
  releaseNotes: string;
  /** Date de publication ISO */
  publishedAt: string;
  /** Nom du fichier (ex: "ValoStats-Setup-1.0.0.exe") */
  filename: string;
  /** Plateforme cible (win32, darwin, linux) */
  platform: string;
  /** Architecture (x64, arm64) */
  arch: string;
  /** Checksum SHA256 (optionnel) */
  checksum?: string;
}

export interface DownloadSourceConfig {
  /** Identifiant unique de la source */
  name: string;
  [key: string]: unknown;
}

export interface DownloadSource {
  /** Nom de la source (github, s3, local) */
  readonly name: string;
  /** Initialisation de la source avec sa config */
  init(config: DownloadSourceConfig): Promise<void>;
  /** Récupère les infos de la dernière version */
  getLatestDownload(): Promise<DownloadInfo>;
  /** Récupère les infos d'une version spécifique */
  getDownloadForVersion(version: string): Promise<DownloadInfo>;
  /** Teste la connexion à la source */
  healthCheck(): Promise<boolean>;
}
