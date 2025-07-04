import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { profileWithKiosqsFactory } from "@/utils/factories/profiles-with-kiosqs-factory";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  try {
    const supabase = await createClient();
    const { locale, slug } = await params;

    // Query the profiles table for a vendor profile with the given slug in the specified locale
    const { data, error } = await supabase
      .from("profiles")
      .select("*, kiosqs(*)")
      .eq("type", "vendor")
      .eq("is_active", true)
      .eq("is_reviewed", true)
      .eq("is_deleted", false)
      .filter("slug_translations", "cs", JSON.stringify({ [locale]: slug }))
      .single();

    if (error) {
      // If no profile found or other error
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
      }

      console.error("Error fetching vendor profile:", error);
      return NextResponse.json({ error: "Failed to fetch vendor profile" }, { status: 500 });
    }

    // Double-check that the profile type is vendor (extra safety)
    if (data.type !== "vendor") {
      return NextResponse.json({ error: "Profile is not a vendor" }, { status: 404 });
    }

    return NextResponse.json(profileWithKiosqsFactory(data));
  } catch (error) {
    console.error("Error in vendor profile API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
