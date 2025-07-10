"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadImage } from "@/utils/upload-image";
import { RawProductVariant } from "@/types/app";
import { productRevalidator } from "@/actions/revalidators/product-revalidator";

export type CreateProductVariantParams = {
  productId: string;
  quantity: number;
  unit: string;
  price: number;
  imageUrl?: string | null;
  isDefault?: boolean;
};

export const createProductVariant = async (params: CreateProductVariantParams) => {
  const supabase = await createClient();

  const { productId, quantity, unit, price, imageUrl, isDefault } = params;

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user.user) {
    throw new Error("User not found");
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("profile_id, slug_translations")
    .eq("id", productId)
    .single();

  if (productError) {
    console.error("Error fetching product data:", productError);
    throw productError;
  }

  if (isDefault) {
    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ is_default: false })
      .eq("product_id", productId);

    if (updateError) {
      console.error("Error updating other variants:", updateError);
      throw updateError;
    }
  }

  const { data: variantData, error: variantError } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      quantity,
      unit,
      image_url: imageUrl && !imageUrl.startsWith("data:") ? imageUrl : null,
      is_default: isDefault || false,
    })
    .select("id")
    .single();

  if (variantError) {
    console.error("Error creating variant:", variantError);
    throw variantError;
  }

  const { error: priceError } = await supabase.from("product_prices").insert({
    variant_id: variantData.id,
    base_price: price,
  });

  if (priceError) {
    console.error("Error creating price:", priceError);
    throw priceError;
  }

  if (imageUrl && imageUrl.startsWith("data:")) {
    try {
      const profileId = productData.profile_id;

      const uploadedImageUrl = await uploadImage({
        base64Image: imageUrl,
        userId: user.user.id,
        identifier: variantData.id,
        filePrefix: "variant",
        bucketName: "product-variants-images",
        pathBuilder: ({ identifier, filePrefix, randomId, fileExt }) =>
          `${profileId}/${productId}/${identifier}_${filePrefix}${randomId}.${fileExt}`,
      });

      await supabase
        .from("product_variants")
        .update({ image_url: uploadedImageUrl })
        .eq("id", variantData.id);
    } catch (error) {
      console.error("Error uploading variant image:", error);
    }
  }

  const { data: productVariant, error: fetchError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", variantData.id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  productRevalidator({
    productId,
    profileId: productData.profile_id,
    slugTranslations: productData.slug_translations,
  });

  return productVariant as unknown as RawProductVariant;
};
