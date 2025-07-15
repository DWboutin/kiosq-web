"use server";

import { createClient } from "@/utils/supabase/server";

export const createReservation = async ({
  productId,
  variantId,
}: {
  productId: string;
  variantId: string;
}) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("User not found");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, product_variants(id)")
    .eq("id", productId)
    .eq("product_variants.id", variantId)
    .single();

  if (productError) {
    throw productError;
  }

  return product;
};
