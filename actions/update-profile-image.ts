"use server";

import { cacheKeys } from "@/utils/cache-keys";
import { LOCALES } from "@/utils/constants";
import { createClient } from "@/utils/supabase/server";
import { uploadImage } from "@/utils/upload-image";
import { revalidatePath, revalidateTag } from "next/cache";

interface UpdateProfileImageArgs {
  profileId: string;
  profileImage: string; // base64 image string
}

export const updateProfileImage = async (data: UpdateProfileImageArgs) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("User not found");
  }

  // Verify the profile belongs to the current user and get current profile image
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, user_id, profile_image, slug_translations")
    .eq("id", data.profileId)
    .eq("user_id", user.user.id)
    .single();

  if (profileError) {
    throw profileError;
  }
  if (!profile) {
    throw new Error("Profile not found or access denied");
  }

  try {
    // If profileImage is empty, remove the existing profile image
    if (data.profileImage === "") {
      // Delete existing profile image if it exists
      if (profile.profile_image) {
        try {
          // Extract the file path from the profile image URL
          const url = new URL(profile.profile_image);
          const pathSegments = url.pathname.split("/");
          // Remove empty segments and find the path after the bucket name
          const cleanSegments = pathSegments.filter((segment) => segment.length > 0);
          const bucketIndex = cleanSegments.findIndex((segment) => segment === "profile-images");

          if (bucketIndex !== -1 && bucketIndex < cleanSegments.length - 1) {
            const filePath = cleanSegments.slice(bucketIndex + 1).join("/");

            await supabase.storage.from("profile-images").remove([filePath]);
          }
        } catch (deleteError) {
          console.warn("Error deleting existing profile image:", deleteError);
          // Continue with update even if deletion fails
        }
      }

      // Update the profile to remove the profile image
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ profile_image: null })
        .eq("id", data.profileId)
        .select("profile_image")
        .single();

      if (updateError) {
        throw updateError;
      }

      revalidatePath("/dashboard/your-store");
      LOCALES.forEach((locale) => {
        revalidateTag(
          cacheKeys.vendorProfileFromSlug(profile.slug_translations[locale], locale).tag
        );
      });

      return updatedProfile;
    }

    // Delete existing profile image if it exists (for replacement)
    if (profile.profile_image) {
      try {
        // Extract the file path from the profile image URL
        const url = new URL(profile.profile_image);
        const pathSegments = url.pathname.split("/");
        // Remove empty segments and find the path after the bucket name
        const cleanSegments = pathSegments.filter((segment) => segment.length > 0);
        const bucketIndex = cleanSegments.findIndex((segment) => segment === "profile-images");

        if (bucketIndex !== -1 && bucketIndex < cleanSegments.length - 1) {
          const filePath = cleanSegments.slice(bucketIndex + 1).join("/");

          await supabase.storage.from("profile-images").remove([filePath]);
        }
      } catch (deleteError) {
        console.warn("Error deleting existing profile image:", deleteError);
        // Continue with upload even if deletion fails
      }
    }

    const profileImageUrl = await uploadImage({
      base64Image: data.profileImage,
      userId: user.user.id,
      identifier: data.profileId,
      filePrefix: "profile",
      bucketName: "profile-images",
      pathBuilder: ({ identifier, filePrefix, randomId, fileExt }) =>
        `profiles/${identifier}/${filePrefix}${randomId}.${fileExt}`,
    });

    // Update the profile with the new profile image URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ profile_image: profileImageUrl })
      .eq("id", data.profileId)
      .select("profile_image")
      .single();

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/dashboard/your-store");
    LOCALES.forEach((locale) => {
      revalidateTag(cacheKeys.vendorProfileFromSlug(profile.slug_translations[locale], locale).tag);
    });

    return updatedProfile;
  } catch (error) {
    console.error("Error updating profile image:", error);
    throw error;
  }
};
