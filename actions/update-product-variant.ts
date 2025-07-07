"use server";

import { createClient } from "@/utils/supabase/server";
import { uploadImage } from "@/utils/upload-image";
import { RawProductVariant } from "@/types/app";
import { productRevalidator } from "@/actions/revalidators/product-revalidator";

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

  const { data: currentVariant, error: currentVariantError } = await supabase
    .from("product_variants")
    .select("*, product:products(profile_id, profiles(slug_translations))")
    .eq("id", id)
    .single();

  if (currentVariantError) {
    throw currentVariantError;
  }

  let finalImageUrl: string | null | undefined = currentVariant.image_url;

  if (imageUrl && imageUrl.startsWith("data:")) {
    if (currentVariant.product && !Array.isArray(currentVariant.product)) {
      try {
        if (currentVariant.image_url) {
          const oldImagePath = new URL(currentVariant.image_url).pathname.split(
            "/product-variants-images/"
          )[1];
          if (oldImagePath) {
            await supabase.storage.from("product-variants-images").remove([oldImagePath]);
          }
        }
        const profileId = currentVariant.product.profile_id;
        const productId = currentVariant.product_id;

        finalImageUrl = await uploadImage({
          base64Image: imageUrl,
          userId: user.user.id,
          identifier: id,
          filePrefix: "variant",
          bucketName: "product-variants-images",
          pathBuilder: ({ identifier, filePrefix, randomId, fileExt }) =>
            `${profileId}/${productId}/${identifier}_${filePrefix}${randomId}.${fileExt}`,
        });
      } catch (error) {
        console.error("Error uploading variant image:", error);
      }
    }
  } else if (imageUrl === "" && currentVariant.image_url) {
    try {
      const oldImagePath = new URL(currentVariant.image_url).pathname.split(
        "/product-variants-images/"
      )[1];
      if (oldImagePath) {
        await supabase.storage.from("product-variants-images").remove([oldImagePath]);
      }
      finalImageUrl = null;
    } catch (error) {
      console.error("Error deleting variant image:", error);
    }
  }

  const { error: updateError } = await supabase
    .from("product_variants")
    .update({
      quantity,
      unit,
      is_default: isDefault,
      image_url: finalImageUrl,
    })
    .eq("id", id);

  if (updateError) {
    throw updateError;
  }

  if (isDefault) {
    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ is_default: false })
      .eq("product_id", currentVariant.product_id)
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

  productRevalidator({
    productId: currentVariant.product_id,
    profileId: currentVariant.product.profile_id,
    slugTranslations: currentVariant.product.profiles.slug_translations,
  });

  const { data: productVariant } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", id)
    .single();

  return productVariant as unknown as RawProductVariant;
};
