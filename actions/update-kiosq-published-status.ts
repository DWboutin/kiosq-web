"use server";

import { kiosqsRevalidator } from "@/actions/revalidators/kiosqs-revalidator";
import { PublishedStatus } from "@/types/app";
import { createClient } from "@/utils/supabase/server";

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

    kiosqsRevalidator({ profileId, kiosqId });

    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
