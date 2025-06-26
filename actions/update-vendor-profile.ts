"use server";

import { createClient } from "@/utils/supabase/server";
import { Locales } from "@/types/app";

interface UpdateVendorProfileArgs {
  profileId: string;
  name: string;
  name_translations: Record<string, string>;
  description: string;
  description_translations: Record<string, string>;
  slug: string;
  slug_translations: Record<string, string>;
  facebook_page_url?: string;
  x_page_url?: string;
  instagram_page_url?: string;
  tiktok_page_url?: string;
  locale: Locales;
}

export const updateVendorProfile = async (data: UpdateVendorProfileArgs) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("User not found");
  }

  // Prepare the update data
  const updateData = {
    name_translations: {
      [data.locale]: data.name,
      ...data.name_translations,
    },
    description_translations: {
      [data.locale]: data.description,
      ...data.description_translations,
    },
    slug_translations: {
      [data.locale]: data.slug,
      ...data.slug_translations,
    },
    updated_at: new Date().toISOString(),
    // Add social media URLs (handle empty strings as null)
    facebook_page_url: data.facebook_page_url?.trim() || null,
    x_page_url: data.x_page_url?.trim() || null,
    instagram_page_url: data.instagram_page_url?.trim() || null,
    tiktok_page_url: data.tiktok_page_url?.trim() || null,
  };

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", data.profileId)
    .select()
    .single();

  if (error) {
    // Handle slug uniqueness constraint violation
    if (error.message?.includes("Profile slug must be unique")) {
      throw new Error("SLUG_NOT_UNIQUE");
    }
    throw error;
  }

  return profile;
};
