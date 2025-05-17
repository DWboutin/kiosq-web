"use server";

import { createClient } from "@/utils/supabase/server";
import { profilesFactory } from "@/utils/factories/profiles-factory";

export const getUserProfiles = async () => {
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
    .eq("user_id", user.user.id);

  if (profilesError) {
    throw profilesError;
  }

  return profilesFactory(profiles);
};
