import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { slug, profileId, locale } = await request.json();

    if (!slug || !locale) {
      return NextResponse.json({ error: "Slug and locale are required" }, { status: 400 });
    }

    // Check if the slug exists in any profile's slug_translations (excluding the current profile if updating)
    let query = supabase.from("profiles").select("id, slug_translations").eq("is_deleted", false);

    if (profileId) {
      query = query.neq("id", profileId);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error("Error checking slug availability:", error);
      return NextResponse.json({ error: "Failed to check slug availability" }, { status: 500 });
    }

    // Check if the slug exists in any profile's slug_translations
    const slugExists = profiles?.some((profile) => {
      if (!profile.slug_translations) return false;

      // Check all language values in slug_translations
      const slugValues = Object.values(profile.slug_translations as Record<string, string>);
      return slugValues.some((value) => value === slug);
    });

    return NextResponse.json({
      available: !slugExists,
      message: slugExists ? "Slug is already taken" : "Slug is available",
    });
  } catch (error) {
    console.error("Error in check-slug API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
