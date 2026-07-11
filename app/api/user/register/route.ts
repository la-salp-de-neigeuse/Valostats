import { NextResponse } from "next/server";
import { ZodError } from "zod";

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

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          publicSlug: user.publicSlug,
          visibility: user.visibility,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Champs invalides." }, { status: 422 });
    }

    return jsonError(error);
  }
}
