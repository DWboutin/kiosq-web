"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { cacheKeys } from "@/utils/cache-keys";

export type UpdateProductVariantParams = {
  id: string;
  quantity: number;
  unit: string;
  price: number;
  imageUrl?: string | null;
  isDefault?: boolean;
};

export const updateProductVariant = async (params: UpdateProductVariantParams) => {
  const supabase = await createClient();

  const { id, quantity, unit, price, imageUrl, isDefault } = params;

  // First, update the product variant
  const { data: variantData, error: variantError } = await supabase
    .from("product_variants")
    .update({
      quantity,
      unit,
      image_url: imageUrl,
      is_default: isDefault,
    })
    .eq("id", id)
    .select("product_id")
    .single();

  if (variantError) {
    throw variantError;
  }

  // Update the product price
  const { error: priceError } = await supabase
    .from("product_prices")
    .update({
      base_price: price,
    })
    .eq("variant_id", id);

  if (priceError) {
    throw priceError;
  }

  // Revalidate cache
  revalidateTag(cacheKeys.currentUserProductById(variantData.product_id).tag);

  return { id, product_id: variantData.product_id };
};
