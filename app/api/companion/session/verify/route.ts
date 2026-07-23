import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const partnerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!partnerToken) {
    return NextResponse.json({ error: "Token requis" }, { status: 401 });
  }

  const linkSession = await prisma.companionSession.findUnique({
    where: { partnerToken },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          plan: true,
          visibility: true,
          publicSlug: true,
          privacyVersion: true,
          sessionVersion: true,
        },
      },
    },
  });

  if (!linkSession || linkSession.status !== "LINKED") {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  if (!linkSession.user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true, user: linkSession.user });
}
