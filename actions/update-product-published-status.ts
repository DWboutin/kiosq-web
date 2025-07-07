"use server";

import { productRevalidator } from "@/actions/revalidators/product-revalidator";
import { Locales, PublishedStatus } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";

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

    const { data: updatedProduct, error: productError } = await supabase
      .from("products")
      .update({ status, updated_at: new Date().toISOString(), updated_by: user.user.id })
      .eq("id", productId)
      .select(
        `
        id,
        profile_id,
        profiles!inner(
          id,
          slug_translations
        )
      `
      )
      .single();

    if (productError) {
      throw productError;
    }

    // Type assertion for the single profile object returned by inner join with .single()
    type UpdatedProductWithProfile = {
      id: string;
      profile_id: string;
      profiles: {
        id: string;
        slug_translations: Record<Locales, string>;
      };
    };
    const typedUpdatedProduct = updatedProduct as unknown as UpdatedProductWithProfile;

    productRevalidator({
      productId,
      profileId: typedUpdatedProduct.profile_id,
      slugTranslations: typedUpdatedProduct.profiles.slug_translations,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
