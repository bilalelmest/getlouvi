import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getStripePrices } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { planId, annual } = await request.json();

    if (!planId || !getStripePrices()[planId]) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, stripe_subscription_id, company_name")
      .eq("id", user.id)
      .single();

    // Create or retrieve Stripe customer
    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Try to find existing customer on Stripe by email
      const existing = await getStripe().customers.list({
        email: user.email!,
        limit: 1,
      });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await getStripe().customers.create({
          email: user.email,
          name: profile?.company_name || undefined,
          metadata: { supabase_user_id: user.id },
        });
        customerId = customer.id;
      }

      // Save customer ID to profile
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Get the right price ID
    const priceId = annual
      ? getStripePrices()[planId].annual
      : getStripePrices()[planId].monthly;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://getlouvi.com";

    // If user already has an active subscription, update it instead of creating a new one
    if (profile?.stripe_subscription_id) {
      try {
        const subscription = await getStripe().subscriptions.retrieve(
          profile.stripe_subscription_id
        );
        if (subscription.status === "active" || subscription.status === "trialing") {
          await getStripe().subscriptions.update(profile.stripe_subscription_id, {
            items: [
              {
                id: subscription.items.data[0].id,
                price: priceId,
              },
            ],
            metadata: {
              supabase_user_id: user.id,
              plan_id: planId,
            },
            proration_behavior: "create_prorations",
          });

          // Update plan in profile immediately
          await getSupabaseAdmin()
            .from("profiles")
            .update({ plan: planId })
            .eq("id", user.id);

          return NextResponse.json({ url: `${appUrl}/dashboard/upgrade?success=true` });
        }
      } catch {
        // Subscription not found or invalid, proceed with new checkout
      }
    }

    // Create checkout session for new subscription
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/upgrade?success=true`,
      cancel_url: `${appUrl}/dashboard/upgrade?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan_id: planId,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
