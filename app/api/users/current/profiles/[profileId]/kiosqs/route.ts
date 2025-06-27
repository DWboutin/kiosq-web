import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) => {
  try {
    const { profileId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: kiosqs, error: kiosqsError } = await supabase
      .from("kiosqs")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_deleted", false);

    if (kiosqsError) {
      console.error("Error fetching kiosqs", kiosqsError);
      return NextResponse.json({ error: "Error fetching kiosqs" }, { status: 500 });
    }

    return NextResponse.json({
      kiosqs: kiosqs || [],
    });
  } catch (error) {
    console.error("Error fetching kiosqs", error);
    return NextResponse.json({ error: "Error fetching kiosqs" }, { status: 500 });
  }
};
