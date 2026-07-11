import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { unlinkRiotAccount } from "@/services/riot-account/riot-account-service";

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

    await unlinkRiotAccount(user.id);

    return NextResponse.json({ message: "Compte Riot délié avec succès" });
  } catch (error) {
    return jsonError(error);
  }
}
