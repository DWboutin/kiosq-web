"use server";

import { ProductCategoryFormValues } from "@/features/product-category-form-drawer/hooks/use-product-category-form";
import { UpdateWithLocale } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

type UpdateProductCategoryArgs = UpdateWithLocale<ProductCategoryFormValues>;

export const updateProductCategory = async (category: UpdateProductCategoryArgs) => {
  try {
    const supabase = await createClient();
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }
    if (!user) {
      throw new Error("User not found");
    }

    const { data, error } = await supabase
      .from("categories")
      .update({
        name_translations: {
          [category.locale]: category.name,
          ...category.name_translations,
        },
        description_translations: {
          [category.locale]: category.description,
          ...category.description_translations,
        },
        slug: {
          [category.locale]: category.slug,
          ...category.slug_translations,
        },
        parent_id: category.parentId === "false" ? null : category.parentId,
        order_rank: category.orderRank,
        updated_at: new Date().toISOString(),
        updated_by: user.user.id,
      })
      .eq("id", category.id);

    if (error) {
      // Check for slug uniqueness error
      if (error.code === "P0001" && error.message.includes("Slug")) {
        throw new Error(`Slug Error: ${error.message}`);
      }
      throw new Error(error.message);
    }

    revalidateTag(cacheKeys.productCategories.list.tag);

    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Slug")) {
      throw error;
    }
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error("Failed to update product category");
  }
};
