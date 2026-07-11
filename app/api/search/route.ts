import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { searchAll } from "@/services/search/search-service";
import { jsonError } from "@/lib/security/request";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 25);

    const results = await searchAll(session.user.id, q, limit);
    return NextResponse.json({ results, total: results.length });
  } catch (error) {
    return jsonError(error);
  }
}
