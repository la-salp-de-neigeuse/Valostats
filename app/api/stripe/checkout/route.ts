import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { assertSameOrigin, HttpError, jsonError } from "@/lib/security/request";
import { createCheckoutSession } from "@/services/subscription/subscription-service";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      redirect("/login");
    }

    const url = await createCheckoutSession(user.id);
    redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la création du checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);

    const user = await getCurrentUser();
    if (!user) {
      throw new HttpError(401, "Non authentifié");
    }

    const rateCheck = await checkRateLimit(user.id, "stripe");
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

    const url = await createCheckoutSession(user.id);

    return NextResponse.json({ url });
  } catch (error) {
    return jsonError(error);
  }
}
