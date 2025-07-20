"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function clearSupabaseSession() {
  try {
    const supabase = await createClient();

    // Sign out the user to clear the session
    await supabase.auth.signOut();

    // Clear any Supabase-related cookies
    const cookieStore = await cookies();
    const supabaseCookies = cookieStore
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-") || cookie.name.includes("supabase"));

    supabaseCookies.forEach((cookie) => {
      cookieStore.delete(cookie.name);
    });
  } catch (error) {
    // If clearing fails, just log it but don't throw
    console.warn("Failed to clear Supabase session:", error);
  }
}
