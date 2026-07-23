import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key || typeof key !== "string") {
    return NextResponse.json({ status: "error", error: "Clé requise" }, { status: 400 });
  }

  const session = await prisma.companionSession.findUnique({
    where: { pollKey: key },
  });

  if (!session) {
    return NextResponse.json({ status: "error", error: "Clé invalide" }, { status: 404 });
  }

  if (session.expiresAt < new Date()) {
    return NextResponse.json({ status: "EXPIRED" });
  }

  if (session.status === "LINKED" && session.partnerToken) {
    return NextResponse.json({ status: "LINKED", token: session.partnerToken });
  }

  return NextResponse.json({ status: "PENDING" });
}
