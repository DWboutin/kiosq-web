"use server";

import { productRevalidator } from "@/actions/revalidators/product-revalidator";
import { ProductFormValues } from "@/features/product-form-drawer/utils/product-form-validation-schema";
import { UpdateWithLocale } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

type UpdateProductArgs = UpdateWithLocale<ProductFormValues>;

export const updateProduct = async (product: UpdateProductArgs) => {
  try {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }
    if (!user) {
      throw new Error("User not found");
    }

    const { data: productData, error: productError } = await supabase
      .from("products")
      .update({
        name_translations: {
          [product.locale]: product.name,
          ...product.name_translations,
        },
        description_translations: {
          [product.locale]: product.description,
          ...product.description_translations,
        },
        category_id: product.subcategory,
        checklist_translations: product.checklist.map((item) => ({
          [product.locale]: item.value,
          ...item.value_translations,
        })),
        updated_at: new Date().toISOString(),
        updated_by: user.user.id,
      })
      .eq("id", product.id)
      .select("*, profile:profiles(slug_translations)")
      .single();

    if (productError) {
      throw productError;
    }

    productRevalidator({
      productId: product.id,
      profileId: productData.profile_id,
      slugTranslations: productData.profile.slug_translations,
    });

    return productData;
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error("Failed to update product");
  }
};
