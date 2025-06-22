"use server";

import { PublishedStatus } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

export const updateProductPublishedStatus = async (productId: string, status: PublishedStatus) => {
  try {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user.user) {
      throw new Error("User not found");
    }

    const { error: productError } = await supabase
      .from("products")
      .update({ status, updated_at: new Date().toISOString(), updated_by: user.user.id })
      .eq("id", productId);

    if (productError) {
      throw productError;
    }

    revalidateTag(cacheKeys.currentUserProductById(productId).tag);

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
