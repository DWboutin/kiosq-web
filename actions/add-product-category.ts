"use server";

import { ProductCategoryFormValues } from "@/features/product-category-form-drawer/hooks/use-product-category-form";
import { InsertWithLocale } from "@/types/app";
import { createClient } from "@/utils/supabase/server";

type AddProductCategoryArgs = InsertWithLocale<ProductCategoryFormValues>;

export const addProductCategory = async (category: AddProductCategoryArgs) => {
  const supabase = await createClient();

  const { data, error } = await supabase.from("categories").insert({
    name_translations: {
      [category.locale]: category.name,
    },
    description_translations: {
      [category.locale]: category.description,
    },
    slug: {
      [category.locale]: category.slug,
    },
    parent_id: category.parentId === "false" ? null : category.parentId,
    order_rank: category.orderRank,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
