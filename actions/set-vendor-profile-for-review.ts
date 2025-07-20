"use server";

import { createClient } from "@/utils/supabase/server";
import { Locales } from "@/types/app";
import { profileRevalidator } from "@/actions/revalidators/profile-revalidator";

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

export const setVendorProfileForReview = async (profileId: string) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("User not found");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      is_active: true,
    })
    .eq("id", profileId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  profileRevalidator({ profileId: profileId });

  return profile;
};
