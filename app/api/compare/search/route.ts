import { NextResponse } from "next/server";
import { searchPlayers } from "@/services/users/user-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const results = await searchPlayers(q);
  return NextResponse.json(results);
}
