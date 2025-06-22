"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { cacheKeys } from "@/utils/cache-keys";

export type DeleteProductVariantParams = {
  variantId: string;
  productId: string;
};

export const deleteProductVariant = async (params: DeleteProductVariantParams) => {
  const supabase = await createClient();

  const { variantId, productId } = params;

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user.user) {
    throw new Error("User not found");
  }

  const { data: variantData, error: variantError } = await supabase
    .from("product_variants")
    .select("id, image_url, product_id")
    .eq("id", variantId)
    .single();

  if (variantError) {
    console.error("Error fetching variant data:", variantError);
    throw variantError;
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("id, profile_id")
    .eq("id", variantData.product_id)
    .single();

  if (productError) {
    console.error("Error fetching product data:", productError);
    throw productError;
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.user.id)
    .eq("type", "vendor")
    .single();

  if (profileError || !userProfile) {
    throw new Error("User profile not found");
  }

  if (productData.profile_id !== userProfile.id) {
    throw new Error("Unauthorized: You don't own this product variant");
  }

  const { error: priceError } = await supabase
    .from("product_prices")
    .delete()
    .eq("variant_id", variantId);

  if (priceError) {
    console.error("Error deleting product price:", priceError);
    throw priceError;
  }

  if (variantData.image_url) {
    try {
      const url = new URL(variantData.image_url);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.findIndex((part) => part === "product-variants-images");
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        const filePath = pathParts.slice(bucketIndex + 1).join("/");

        const { error: deleteImageError } = await supabase.storage
          .from("product-variants-images")
          .remove([filePath]);

        if (deleteImageError) {
          console.error("Error deleting variant image:", deleteImageError);
        }
      }
    } catch (error) {
      console.error("Error processing image deletion:", error);
    }
  }

  const { error: deleteError } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (deleteError) {
    console.error("Error deleting product variant:", deleteError);
    throw deleteError;
  }

  revalidateTag(cacheKeys.currentUserProductById(productId).tag);

  return { success: true, deletedVariantId: variantId };
};
