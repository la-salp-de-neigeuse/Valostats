import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { encode } from "next-auth/jwt";

import { assertSameOrigin, jsonError, readJsonBody } from "@/lib/security/request";
import { registerSchema } from "@/lib/validation/auth";
import { registerUser } from "@/services/users/user-service";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(ip, "register");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Trop de comptes créés depuis cette adresse IP. Réessayez dans une minute." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateCheck.resetAt / 1000)),
          },
        },
      );
    }

    const body = await readJsonBody(request);
    const input = registerSchema.parse(body);
    const user = await registerUser(input);

    const token = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      visibility: user.visibility,
      publicSlug: user.publicSlug,
      privacyVersion: user.privacyVersion,
      sessionVersion: user.sessionVersion,
      rememberMe: true,
    };

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Erreur de configuration serveur." }, { status: 500 });
    }

    const encodedToken = await encode({ token, secret });

    const response = NextResponse.json(
      { success: true },
      { status: 201 },
    );

    response.cookies.set("next-auth.session-token", encodedToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }

    return jsonError(error);
  }
}
