import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { HttpError, jsonError } from "@/lib/security/request";
import { searchAll } from "@/services/search/search-service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new HttpError(401, "Non authentifié.");

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 25);

    const results = await searchAll(user.id, q, limit);
    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    return jsonError(error);
  }
}
