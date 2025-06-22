"use server";

import { authenticatedUserProductFactory } from "@/utils/factories/authenticated-user-product-factory";
import { createClient } from "@/utils/supabase/server";

export const getAuthenticatedUserProductById = async (productId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      `
        *,
        categories (
          *,
          parent_category:parent_id(*)
        ),
        product_variants (
          *,
          product_prices(*)
        )
      `
    )
    .eq("id", productId)
    .single();

  if (productError) {
    console.error(`Error fetching product id ${productId}`, productError);
    throw new Error(`Error fetching product id ${productId}`);
  }

  return authenticatedUserProductFactory(product);
};
