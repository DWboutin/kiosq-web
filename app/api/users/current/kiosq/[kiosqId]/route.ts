import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ kiosqId: string }> }
) => {
  try {
    const { kiosqId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the specific kiosq
    const { data: kiosq, error: kiosqError } = await supabase
      .from("kiosqs")
      .select("*")
      .eq("id", kiosqId)
      .single();

    if (kiosqError) {
      return NextResponse.json(
        { error: "Error fetching kiosq", details: kiosqError.message },
        { status: 500 }
      );
    }

    if (!kiosq) {
      return NextResponse.json({ error: "Kiosq not found" }, { status: 404 });
    }

    return NextResponse.json({ kiosq });
  } catch (error) {
    console.error("Unexpected error in kiosq API:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};
