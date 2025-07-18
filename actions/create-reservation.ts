"use server";

import { createClient } from "@/utils/supabase/server";

export const createReservation = async ({
  variantId,
  paymentIntentId,
  quantity,
  kiosqId,
}: {
  variantId: string;
  paymentIntentId: string;
  quantity: number;
  kiosqId: string;
}) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user.user) {
    throw new Error("User not found");
  }

  // Get product variant and price details
  const { data: variant, error: variantError } = await supabase
    .from("product_variants")
    .select(
      `
      id,
      unit,
      product_id,
      products!inner(
        id,
        profile_id
      ),
      product_prices(
        base_price,
        discount_amount,
        currency
      )
    `
    )
    .eq("id", variantId)
    .single();

  if (variantError || !variant) {
    throw new Error("Product variant not found");
  }

  // Calculate total amount
  const price = variant.product_prices?.[0]; // Get first price from array
  if (!price) {
    throw new Error("Product price not found");
  }

  const effectivePrice = price.base_price - (price.discount_amount || 0);
  const totalAmount = Math.round(effectivePrice * quantity * 100); // Convert to cents

  // Create reservation first
  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .insert({
      customer_id: user.user.id,
      vendor_profile_id: (variant.products as unknown as { profile_id: string }).profile_id,
      kiosq_id: kiosqId,
      status: "pending",
      notes: `Reservation for ${quantity} ${variant.unit}`,
    })
    .select()
    .single();

  if (reservationError || !reservation) {
    console.error("Reservation creation error:", reservationError);
    throw new Error("Failed to create reservation");
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      reservation_id: reservation.id,
      customer_id: user.user.id,
      vendor_profile_id: (variant.products as unknown as { profile_id: string }).profile_id,
      kiosq_id: kiosqId,
      order_time: new Date().toISOString(),
      total_amount: totalAmount,
      stripe_payment_intent_id: paymentIntentId,
      status: "waiting-approval",
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("Order creation error:", orderError);
    throw new Error("Failed to create order");
  }

  // Create order item
  const { data: orderItem, error: orderItemError } = await supabase
    .from("order_items")
    .insert({
      order_id: order.id,
      reservation_id: reservation.id,
      product_variant_id: variantId,
      quantity: quantity,
      unit_price: effectivePrice,
      unit: variant.unit || "unit",
    })
    .select()
    .single();

  if (orderItemError || !orderItem) {
    console.error("Order item creation error:", orderItemError);
    throw new Error("Failed to create order item");
  }

  return {
    reservation,
    order,
    orderItem,
  };
};
