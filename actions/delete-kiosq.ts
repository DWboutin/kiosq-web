"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { cacheKeys } from "@/utils/cache-keys";

export type DeleteKiosqParams = {
  kiosqId: string;
};

export const deleteKiosq = async (params: DeleteKiosqParams) => {
  const supabase = await createClient();

  const { kiosqId } = params;

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user.user) {
    throw new Error("User not found");
  }

  // Get kiosq data to verify ownership and check if it's default
  const { data: kiosqData, error: kiosqError } = await supabase
    .from("kiosqs")
    .select("id, image_url, profile_id, is_default")
    .eq("id", kiosqId)
    .single();

  if (kiosqError) {
    console.error("Error fetching kiosq data:", kiosqError);
    throw kiosqError;
  }

  // Prevent deletion of default kiosq
  if (kiosqData.is_default) {
    throw new Error("Cannot delete default kiosq");
  }

  // Verify user owns this kiosq
  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.user.id)
    .eq("type", "vendor")
    .single();

  if (profileError || !userProfile) {
    throw new Error("User profile not found");
  }

  if (kiosqData.profile_id !== userProfile.id) {
    throw new Error("Unauthorized: You don't own this kiosq");
  }

  // Delete associated image if it exists
  if (kiosqData.image_url) {
    try {
      const url = new URL(kiosqData.image_url);
      const pathParts = url.pathname.split("/");
      const bucketIndex = pathParts.findIndex((part) => part === "kiosqs-images");
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        const filePath = pathParts.slice(bucketIndex + 1).join("/");

        const { error: deleteImageError } = await supabase.storage
          .from("kiosqs-images")
          .remove([filePath]);

        if (deleteImageError) {
          console.error("Error deleting kiosq image:", deleteImageError);
        }
      }
    } catch (error) {
      console.error("Error processing image deletion:", error);
    }
  }

  // Delete the kiosq
  const { error: deleteError } = await supabase.from("kiosqs").delete().eq("id", kiosqId);

  if (deleteError) {
    console.error("Error deleting kiosq:", deleteError);
    throw deleteError;
  }

  // Revalidate cache
  revalidateTag(cacheKeys.currentUserKiosqById(kiosqId).tag);
  revalidateTag(cacheKeys.currentUserProfileIdKiosqs.list(userProfile.id).tag);

  return { success: true, deletedKiosqId: kiosqId };
};
