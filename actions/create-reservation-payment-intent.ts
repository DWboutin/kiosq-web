"use server";

import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_API_KEY!);

export async function createReservationPaymentIntent({
  variantId,
  quantity,
  kiosqId,
  profileId,
}: {
  variantId: string;
  quantity: number;
  kiosqId: string;
  profileId: string;
}) {
  console.log("Creating payment intent for:", { variantId, quantity, kiosqId, profileId });
  const supabase = await createClient();

  // Get the price for the variant (assuming one active price)
  const { data: price, error: priceError } = await supabase
    .from("product_prices")
    .select("*")
    .eq("variant_id", variantId)
    .single();

  console.log("Price data:", price, "Error:", priceError);

  if (priceError || !price) {
    throw new Error("Failed to fetch price");
  }

  // Get vendor's Stripe account ID
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("stripe_account_id")
    .eq("id", profileId)
    .single();

  console.log("Profile data:", profile, "Error:", profileError);

  if (profileError || !profile || !profile.stripe_account_id) {
    throw new Error("Vendor has no connected Stripe account");
  }

  // Calculate amount in cents
  const effectivePrice = price.base_price - (price.discount_amount || 0);
  const amount = Math.round(effectivePrice * quantity * 100);
  const currency = (price.currency || "CAD").toLowerCase();

  console.log("Payment details:", {
    effectivePrice,
    amount,
    currency,
    stripeAccount: profile.stripe_account_id,
  });

  // Create PaymentIntent on connected account
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card"],
      application_fee_amount: Math.round(amount * 0.05), // 5% platform fee
      transfer_data: {
        destination: profile.stripe_account_id,
      },
      metadata: {
        variantId,
        quantity,
        kiosqId,
        profileId,
        vendor_stripe_account: profile.stripe_account_id,
      },
    });

    console.log("PaymentIntent created:", paymentIntent.id);
    console.log("Client secret:", paymentIntent.client_secret);

    if (!paymentIntent.client_secret) {
      throw new Error("Failed to create PaymentIntent");
    }

    return paymentIntent.client_secret;
  } catch (error) {
    console.error("Stripe error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}
