"use server";

import { createClient } from "@/utils/supabase/server";
import { clearSupabaseSession } from "@/actions/session-cleanup";

export const getAuthenticatedUserData = async () => {
  const supabase = await createClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    if (error.code === "user_not_found") {
      return null;
    }
    // Handle "Auth session missing!" error gracefully
    if (error.message.includes("Auth session missing") || error.message.includes("session")) {
      await clearSupabaseSession();
      return null;
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
