import { NextResponse } from "next/server";
import { RiotApiError } from "@/services/riot-api/api-client";
import { MAX_BODY_SIZE } from "@/constants/limits";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");

  if (!origin) {
    throw new HttpError(403, "Requete refusee : origine absente.");
  }

  const host = request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const requestOrigin = host ? `${forwardedProto ?? "http"}://${host}` : null;
  const configuredOrigin = process.env.NEXTAUTH_URL
    ? new URL(process.env.NEXTAUTH_URL).origin
    : null;

  const allowedOrigins = new Set([requestOrigin, configuredOrigin].filter(Boolean));

  if (!allowedOrigins.has(origin)) {
    throw new HttpError(403, "Requete refusee pour origine invalide.");
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    throw new HttpError(413, "Corps de requête trop volumineux.");
  }

  try {
    const text = await request.text();
    if (text.length > MAX_BODY_SIZE) {
      throw new HttpError(413, "Corps de requête trop volumineux.");
    }
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Corps JSON invalide.");
  }
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof RiotApiError) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Erreur inattendue." }, { status: 500 });
}
