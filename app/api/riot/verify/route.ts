import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { verifyRiotAccount } from "@/services/riot-account/riot-account-service";
import { RiotApiError } from "@/services/riot/api-client";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new HttpError(401, "Non authentifié");
    }

    const rateCheck = await checkRateLimit(user.id, "riotVerify");
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

    const account = await verifyRiotAccount(user.id);

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof RiotApiError) {
      if (error.status === 404) {
        return NextResponse.json(
          { error: "Riot ID introuvable. Vérifiez l'orthographe de votre Game Name et Tagline." },
          { status: 404 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "Trop de requêtes vers l'API Riot. Réessayez dans quelques secondes." },
          { status: 429 }
        );
      }
      if (error.status === 403) {
        return NextResponse.json(
          { error: "Clé API Riot invalide ou expirée. Contactez l'administrateur." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Erreur de l'API Riot. Réessayez plus tard." },
        { status: error.status }
      );
    }

    return jsonError(error);
  }
}
