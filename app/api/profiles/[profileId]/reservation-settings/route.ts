import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) => {
  try {
    const { profileId } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", profileId)
      .neq("stripe_account_id", null)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(`Error fetching reservation settings for profile ${profileId}`, error);
      return NextResponse.json(
        { error: `Error fetching reservation settings for profile ${profileId}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasReservationSettings: !!data,
    });
  } catch (error) {
    console.error("Error fetching reservation settings", error);
    return NextResponse.json({ error: "Error fetching reservation settings" }, { status: 500 });
  }
};
