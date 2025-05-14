"use server";

import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";
import { InsertWithLocale } from "@/types/app";
import { createClient } from "@/utils/supabase/server";
import { uploadImage } from "@/utils/upload";
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

  // Create the vendor profile first
  const { data: vendorProfile, error } = await supabase
    .from("profiles")
    .insert({
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
      user_id: user.user.id,
      type: "vendor",
      is_active: false,
      is_reviewed: false,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  // Handle banner image upload if provided
  if (data.bannerImage) {
    try {
      const bannerUrl = await uploadImage({
        base64Image: data.bannerImage,
        userId: user.user.id,
        identifier: vendorProfile.id,
        filePrefix: "banner",
        bucketName: "profile-images",
        pathBuilder: ({ identifier, filePrefix, randomId, fileExt }) =>
          `profiles/${identifier}/${filePrefix}${randomId}.${fileExt}`,
      });

      // Update the profile with the banner URL
      await supabase
        .from("profiles")
        .update({ banner_image: bannerUrl })
        .eq("id", vendorProfile.id);
    } catch (error) {
      console.error("Error uploading banner image:", error);
    }
  }

  revalidatePath("/dashboard/your-store");

  return vendorProfile;
};
