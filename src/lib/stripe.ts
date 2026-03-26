import Stripe from "stripe";

// Lazy initialization to avoid build-time errors when env vars are not set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

// Map plan IDs to Stripe Price IDs
export function getStripePrices(): Record<string, { monthly: string; annual: string }> {
  return {
    starter: {
      monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY!,
      annual: process.env.STRIPE_PRICE_STARTER_ANNUAL!,
    },
    pro: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
      annual: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    },
    business: {
      monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
      annual: process.env.STRIPE_PRICE_BUSINESS_ANNUAL!,
    },
  };
}

// Reverse lookup: Stripe Price ID → Louvi plan name
export function getPlanFromPriceId(priceId: string): "starter" | "pro" | "business" | null {
  const prices = getStripePrices();
  for (const [planId, p] of Object.entries(prices)) {
    if (p.monthly === priceId || p.annual === priceId) {
      return planId as "starter" | "pro" | "business";
    }
  }
  return null;
}
