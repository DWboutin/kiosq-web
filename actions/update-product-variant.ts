"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { cacheKeys } from "@/utils/cache-keys";
import { uploadImage } from "@/utils/upload-image";
import { RawProductVariant } from "@/types/app";

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

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user.user) {
    throw new Error("User not found");
  }

  const { data: variantData, error: variantError } = await supabase
    .from("product_variants")
    .update({
      quantity,
      unit,
      image_url: imageUrl,
      is_default: isDefault,
    })
    .eq("id", id)
    .select("product_id, product:products(profile_id)")
    .single<{ product_id: string; product: { profile_id: string } | null }>();

  if (variantError) {
    throw variantError;
  }

  if (isDefault) {
    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ is_default: false })
      .eq("product_id", variantData.product_id)
      .neq("id", id);

    if (updateError) {
      console.error("Error updating other variants:", updateError);
      throw updateError;
    }
  }

  const { error: priceError } = await supabase
    .from("product_prices")
    .update({
      base_price: price,
    })
    .eq("variant_id", id);

  if (priceError) {
    throw priceError;
  }

  if (
    imageUrl &&
    imageUrl.startsWith("data:") &&
    variantData.product &&
    !Array.isArray(variantData.product)
  ) {
    try {
      const profileId = variantData.product.profile_id;
      const productId = variantData.product_id;

      const uploadedImageUrl = await uploadImage({
        base64Image: imageUrl,
        userId: user.user.id,
        identifier: id,
        filePrefix: "variant",
        bucketName: "product-variants-images",
        pathBuilder: ({ identifier, filePrefix, randomId, fileExt }) =>
          `${profileId}/${productId}/${identifier}_${filePrefix}${randomId}.${fileExt}`,
      });

      await supabase.from("product_variants").update({ image_url: uploadedImageUrl }).eq("id", id);
    } catch (error) {
      console.error("Error uploading variant image:", error);
    }
  }

  const { data: productVariant } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", id)
    .single();

  revalidateTag(cacheKeys.currentUserProductById(variantData.product_id).tag);

  return productVariant as unknown as RawProductVariant;
};
