import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma/client";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

function generatePartnerToken(): string {
  return "cmp_" + randomBytes(32).toString("base64url");
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  let code = "";
  try {
    const body = await request.json();
    code = body.code;
  } catch {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code requis" }, { status: 400 });
  }

  const linkSession = await prisma.companionSession.findUnique({
    where: { code },
  });

  if (!linkSession) {
    return NextResponse.json({ error: "Code invalide" }, { status: 404 });
  }

  if (linkSession.expiresAt < new Date()) {
    return NextResponse.json({ error: "Code expiré" }, { status: 410 });
  }

  if (linkSession.status !== "PENDING") {
    return NextResponse.json({ error: "Code déjà utilisé" }, { status: 409 });
  }

  const partnerToken = generatePartnerToken();

  await prisma.companionSession.update({
    where: { id: linkSession.id },
    data: {
      status: "LINKED",
      partnerToken,
      userId: session.user.id,
      linkedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
