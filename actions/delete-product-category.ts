"use server";

import { cacheKeys } from "@/utils/cache-keys";
import { createClient } from "@/utils/supabase/admin";
import { revalidateTag } from "next/cache";

export const deleteProductCategory = async (categoryId: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("delete_category", {
      category_id: categoryId,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidateTag(cacheKeys.productCategories.list.tag);

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete product category");
  }
};
