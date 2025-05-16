"use server";

import { createClient } from "@/utils/supabase/server";

export const getAuthenticatedUserData = async () => {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    if (error.message === "Auth session missing!") {
      return false;
    }
    throw new Error(error.message);
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.user.id)
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  return userData;
};
