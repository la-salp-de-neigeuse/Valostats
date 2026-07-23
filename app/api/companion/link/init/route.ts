import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

function generateCode(): string {
  return randomBytes(4).toString("base64url").toUpperCase().slice(0, 6);
}

function generatePollKey(): string {
  return randomBytes(24).toString("base64url");
}

export async function POST() {
  const code = generateCode();
  const pollKey = generatePollKey();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.companionSession.create({
    data: { code, pollKey, expiresAt },
  });

  return NextResponse.json({ code, pollKey, expiresAt: expiresAt.toISOString() });
}
