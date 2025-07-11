"use server";

import { categoriesRevalidator } from "@/actions/revalidators/categories-revalidator";
import { createClient } from "@/utils/supabase/admin";

export const deleteProductCategory = async (categoryId: string) => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("delete_category", {
      category_id: categoryId,
    });

    if (error) {
      throw new Error(error.message);
    }

    categoriesRevalidator();

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete product category");
  }
};
