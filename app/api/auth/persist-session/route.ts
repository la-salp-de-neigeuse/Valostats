import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { encode } from "next-auth/jwt";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Erreur de configuration" }, { status: 500 });
  }

  const now = Math.floor(Date.now() / 1000);

  const token = {
    sub: session.user.id,
    name: session.user.name,
    email: session.user.email,
    picture: session.user.image,
    role: session.user.role,
    plan: session.user.plan,
    visibility: session.user.visibility,
    publicSlug: session.user.publicSlug,
    privacyVersion: session.user.privacyVersion,
    sessionVersion: session.user.sessionVersion,
    rememberMe: true,
    iat: now,
    exp: now + 60 * 60 * 24 * 30,
  };

  const encodedToken = await encode({ token, secret });

  const response = NextResponse.json({ success: true });

  response.cookies.set("next-auth.session-token", encodedToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
