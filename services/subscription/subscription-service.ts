import type { SubscriptionStatus, UserPlan } from "@prisma/client";

import { getStripeClient } from "@/lib/stripe/client";
import { PLANS } from "@/lib/stripe/plans";
import { prisma } from "@/lib/prisma/client";
import { hasPremiumAccess } from "@/services/roles/types";

export async function createCheckoutSession(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { stripeCustomer: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const stripe = getStripeClient();
  let customerId = user.stripeCustomer?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId },
    });
    customerId = customer.id;

    await prisma.stripeCustomer.create({
      data: {
        userId,
        stripeCustomerId: customer.id,
      },
    });
  }

  const priceId = PLANS.pro_monthly.priceId;

  if (!priceId) {
    throw new Error("STRIPE_PRICE_PRO_MONTHLY is not configured");
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?subscription=canceled`,
    metadata: { userId },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
}

export async function createPortalSession(userId: string): Promise<string> {
  const stripeCustomer = await prisma.stripeCustomer.findUnique({
    where: { userId },
  });

  if (!stripeCustomer) {
    throw new Error("No Stripe customer found");
  }

  const stripe = getStripeClient();

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomer.stripeCustomerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  });

  return session.url;
}

export async function handleSubscriptionEvent(
  eventType: string,
  stripeSubscription: Record<string, unknown>
) {
  const sub = stripeSubscription as {
    id: string;
    customer: string;
    status: string;
    items: { data: Array<{ price: { id: string } }> };
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
    canceled_at: number | null;
    trial_start: number | null;
    trial_end: number | null;
    metadata: Record<string, string>;
  };

  const userId = sub.metadata?.userId;

  if (!userId) {
    const stripeCustomer = await prisma.stripeCustomer.findUnique({
      where: { stripeCustomerId: sub.customer as string },
    });

    if (!stripeCustomer) return;
  }

  const resolvedUserId = userId ?? (await prisma.stripeCustomer.findUnique({
    where: { stripeCustomerId: sub.customer as string },
    select: { userId: true },
  }))?.userId;

  if (!resolvedUserId) return;

  const productPriceId = sub.items?.data?.[0]?.price?.id;
  const plan: UserPlan = productPriceId === PLANS.pro_monthly.priceId ? "PRO" : "FREE";
  const status = sub.status as SubscriptionStatus;

  const subscriptionData = {
    userId: resolvedUserId,
    stripeSubscriptionId: sub.id,
    stripeCustomerId: sub.customer as string,
    status,
    plan,
    currentPeriodStart: new Date(sub.current_period_start * 1000),
    currentPeriodEnd: new Date(sub.current_period_end * 1000),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
    trialStart: sub.trial_start ? new Date(sub.trial_start * 1000) : null,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
  };

  const activeStatuses = ["active", "trialing"];
  const isActive = activeStatuses.includes(sub.status);

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId: resolvedUserId },
      create: subscriptionData,
      update: subscriptionData,
    }),
    prisma.user.update({
      where: { id: resolvedUserId },
      data: { plan: isActive ? plan : "FREE" },
    }),
  ]);
}

export async function getSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return subscription;
}

export async function isPremiumUser(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, role: true },
  });

  if (!user) return false;

  if (hasPremiumAccess(user.role)) return true;

  return user.plan === "PRO";
}

export async function ensurePremium(userId: string): Promise<void> {
  const premium = await isPremiumUser(userId);

  if (!premium) {
    throw new Error("Cette fonctionnalité nécessite un abonnement Premium");
  }
}
