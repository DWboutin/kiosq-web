"use server";

import { ProductCategoryFormValues } from "@/features/product-category-form-drawer/hooks/use-product-category-form";
import { InsertWithLocale } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

type AddProductCategoryArgs = InsertWithLocale<ProductCategoryFormValues>;

export const addProductCategory = async (category: AddProductCategoryArgs) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("categories").insert({
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
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidateTag(cacheKeys.productCategories.list.tag);

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to add product category");
  }
};
