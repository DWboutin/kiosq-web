import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { authenticatedUserSchedulesFactory } from "@/utils/factories/authenticated-user-schedules-factory";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const { profileId } = await params;

  if (!profileId) {
    return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch schedules for the specific profile
    const { data: schedules, error } = await supabase
      .from("schedules")
      .select("*")
      .eq("profile_id", profileId)
      .order("is_default", { ascending: false });

    if (error) {
      console.error("Error fetching schedules:", error);
      return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
    }

    const transformedSchedules = authenticatedUserSchedulesFactory(schedules || []);
    return NextResponse.json({ schedules: transformedSchedules });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
