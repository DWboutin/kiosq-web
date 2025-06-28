"use server";

import { PublishedStatus } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

export const updateKiosqPublishedStatus = async (
  kiosqId: string,
  profileId: string,
  status: PublishedStatus
) => {
  try {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user.user) {
      throw new Error("User not found");
    }

    const { error: kiosqError } = await supabase
      .from("kiosqs")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", kiosqId);

    if (kiosqError) {
      throw kiosqError;
    }

    revalidateTag(cacheKeys.currentUserKiosqById(kiosqId).tag);
    revalidateTag(cacheKeys.currentUserProfileIdKiosqs.list(profileId).tag);

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
