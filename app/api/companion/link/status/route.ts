import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code || typeof code !== "string") {
    return NextResponse.json({ status: "error", error: "Code requis" }, { status: 400 });
  }

  const session = await prisma.companionSession.findUnique({
    where: { code },
  });

  if (!session) {
    return NextResponse.json({ status: "error", error: "Code invalide" }, { status: 404 });
  }

  if (session.expiresAt < new Date()) {
    return NextResponse.json({ status: "EXPIRED" });
  }

  if (session.status === "LINKED" && session.partnerToken) {
    return NextResponse.json({ status: "LINKED", token: session.partnerToken });
  }

  return NextResponse.json({ status: "PENDING" });
}
