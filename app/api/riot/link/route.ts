import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError, readJsonBody } from "@/lib/security/request";
import { linkRiotAccountSchema } from "@/lib/validation/riot";
import { linkRiotAccount } from "@/services/riot-account/riot-account-service";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);

    const user = await getCurrentUser();
    if (!user) {
      throw new HttpError(401, "Non authentifié");
    }

    const rateCheck = await checkRateLimit(user.id, "riotLink");
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une minute." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateCheck.resetAt / 1000)),
          },
        },
      );
    }

    const body = await readJsonBody(req);
    const input = linkRiotAccountSchema.parse(body);

    const account = await linkRiotAccount(user.id, input);

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }

    return jsonError(error);
  }
}
