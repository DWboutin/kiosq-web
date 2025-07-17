import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_API_KEY!);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentIntentId = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  console.log("Payment success route called:", {
    paymentIntentId,
    redirectStatus,
  });

  if (!paymentIntentId) {
    return NextResponse.redirect(new URL("/payment-error", request.url));
  }

  try {
    // Retrieve the payment intent to get metadata
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log("Retrieved PaymentIntent:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
    });

    if (paymentIntent.status === "succeeded") {
      const supabase = await createClient();

      // Create order record
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: (await supabase.auth.getUser()).data.user?.id,
          vendor_profile_id: paymentIntent.metadata.profileId,
          kiosq_id: paymentIntent.metadata.kiosqId,
          total_amount: paymentIntent.amount / 100, // Convert from cents
          stripe_payment_intent_id: paymentIntent.id,
          status: "confirmed",
          order_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) {
        console.error("Error creating order:", orderError);
        return NextResponse.redirect(new URL("/payment-error", request.url));
      }

      // Create order item
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_variant_id: paymentIntent.metadata.variantId,
        quantity: parseInt(paymentIntent.metadata.quantity),
        unit_price: paymentIntent.amount / 100 / parseInt(paymentIntent.metadata.quantity),
        total_price: paymentIntent.amount / 100,
        unit: "unit", // You might want to get this from the variant
      });

      if (itemError) {
        console.error("Error creating order item:", itemError);
        return NextResponse.redirect(new URL("/payment-error", request.url));
      }

      console.log("Order created successfully:", order.id);

      // Redirect to success page with order ID
      return NextResponse.redirect(new URL(`/payment-success?order=${order.id}`, request.url));
    } else {
      console.log("Payment not succeeded:", paymentIntent.status);
      return NextResponse.redirect(new URL("/payment-error", request.url));
    }
  } catch (error) {
    console.error("Error processing payment success:", error);
    return NextResponse.redirect(new URL("/payment-error", request.url));
  }
}
