"use server";

import { createClient } from "@/utils/supabase/server";

export const getUser = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
};
