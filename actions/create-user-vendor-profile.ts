"use server";

import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";
import { InsertWithLocale } from "@/types/app";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type AddUserVendorProfileArgs = InsertWithLocale<VendorProfileFormValues>;

export const createUserVendorProfile = async (data: AddUserVendorProfileArgs) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("User not found");
  }

  const { data: vendorProfile, error } = await supabase.from("profiles").insert({
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
    banner_image: data.bannerImage,
    user_id: user.user.id,
    type: "vendor",
    is_active: false,
    is_reviewed: false,
  });

  if (error) {
    throw error;
  }

  revalidatePath("/dashboard/your-store");

  return vendorProfile;
};
