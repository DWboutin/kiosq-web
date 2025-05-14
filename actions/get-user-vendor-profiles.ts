"use server";

import { createClient } from "@/utils/supabase/server";
import { Profile } from "@/types/app";

export const getUserVendorProfiles = async (): Promise<Profile[]> => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user.user) {
    throw new Error("User not found");
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .eq("type", "vendor")
    .eq("user_id", user.user.id);

  if (profilesError) {
    throw profilesError;
  }

  return profiles;
};
