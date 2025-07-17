import { kiosqsFactory } from "@/utils/factories/kiosqs-factory";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) => {
  try {
    const { profileId } = await params;
    const supabase = await createClient();

    // Get all kiosqs for the profile
    const { data: kiosqs, error } = await supabase
      .from("kiosqs")
      .select("*")
      .eq("profile_id", profileId)
      .eq("status", "published")
      .eq("is_deleted", false)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Error fetching kiosqs", details: error.message },
        { status: 500 }
      );
    }

    if (!kiosqs || kiosqs.length === 0) {
      return NextResponse.json({ kiosqs: [] }, { status: 200 });
    }

    return NextResponse.json(
      { kiosqs: kiosqsFactory(kiosqs) },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
          "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
          "Vercel-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
          "x-cache-tags": `kiosqs,profile-${profileId}`,
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error in kiosqs API:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};
