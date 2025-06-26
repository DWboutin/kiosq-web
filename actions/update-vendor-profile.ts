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

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
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
    })
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
