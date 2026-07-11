import { NextResponse } from "next/server";

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
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Corps JSON invalide.");
  }
}

export function jsonError(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Erreur inattendue." }, { status: 500 });
}
