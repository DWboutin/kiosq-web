import { profilesFactory } from "@/utils/factories/profiles-factory";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id);

    if (profileError) {
      return NextResponse.json(
        { error: "Error fetching profile data", details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profiles: profilesFactory(profileData),
    });
  } catch (error) {
    console.error("Unexpected error in users API:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};
