import { NextRequest, NextResponse } from "next/server";
import { downloadService } from "@/lib/download";

/**
 * GET /api/download
 *
 * Endpoint de téléchargement ValoStats Companion.
 *
 * Query params:
 *   ?redirect=1   → Redirige directement vers le fichier (302)
 *   (sans)        → Retourne les métadonnées JSON de la dernière version
 *
 * Réponse JSON (quand redirect n'est pas spécifié):
 * ```json
 * {
 *   "version": "1.0.0",
 *   "url": "https://...",
 *   "size": 86000000,
 *   "filename": "ValoStats-Setup-1.0.0.exe",
 *   "platform": "win32",
 *   "arch": "x64",
 *   "releaseNotes": "...",
 *   "publishedAt": "2026-07-15T00:00:00Z",
 *   "checksum": "sha256:..."
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const redirect = searchParams.get("redirect") === "1";
    const version = searchParams.get("version") || undefined;

    const info = version
      ? await downloadService.getDownloadForVersion(version)
      : await downloadService.getLatestDownload();

    if (redirect) {
      const headers = new Headers();
      headers.set("X-Download-Version", info.version);
      headers.set("X-Download-Filename", info.filename);
      headers.set("X-Download-Size", String(info.size));
      headers.set("X-Source", process.env.DOWNLOAD_SOURCE || "local");

      return NextResponse.redirect(info.url, {
        status: 302,
        headers,
      });
    }

    return NextResponse.json({
      version: info.version,
      url: info.url,
      size: info.size,
      filename: info.filename,
      platform: info.platform,
      arch: info.arch,
      releaseNotes: info.releaseNotes,
      publishedAt: info.publishedAt,
      checksum: info.checksum || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";

    return NextResponse.json(
      {
        error: "Téléchargement indisponible",
        message,
        hint: "Vérifier la configuration DOWNLOAD_SOURCE dans le fichier .env",
      },
      { status: 503 }
    );
  }
}
