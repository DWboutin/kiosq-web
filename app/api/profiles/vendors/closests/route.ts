import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { closestVendorProfilesFactory } from "@/utils/factories/closests-vendor-profiles-factory";
import { Database } from "@/types/supabase";

type KiosqWithProfile = {
  profile_id: {
    id: string;
    name_translations: Database["public"]["Tables"]["profiles"]["Row"]["name_translations"];
    slug_translations: Database["public"]["Tables"]["profiles"]["Row"]["slug_translations"];
    description_translations: Database["public"]["Tables"]["profiles"]["Row"]["description_translations"];
    profile_image: string | null;
    banner_image: string | null;
  };
  id: string;
  name_translations: Database["public"]["Tables"]["kiosqs"]["Row"]["name_translations"];
  description_translations: Database["public"]["Tables"]["kiosqs"]["Row"]["description_translations"];
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get location parameters from query string
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const radius = searchParams.get("radius") || "100"; // Default 100km
    const limit = searchParams.get("limit") || "50"; // Default 50 results

    // If location is provided, use the PostGIS RPC function
    if (latitude && longitude) {
      const { data, error } = await supabase.rpc("get_nearby_profiles", {
        user_latitude: parseFloat(latitude),
        user_longitude: parseFloat(longitude),
        search_radius_km: parseInt(radius),
        limit_count: parseInt(limit),
      });

      if (error) {
        console.error("Error fetching nearby profiles:", error);
        return NextResponse.json({ error: "Failed to fetch nearby profiles" }, { status: 500 });
      }

      return NextResponse.json(closestVendorProfilesFactory(data));
    }

    // Fallback: If no location provided, return vendor profiles with their kiosqs (matching RPC structure)
    const { data, error } = await supabase
      .from("kiosqs")
      .select(
        `
        profile_id:profiles!inner(
          id,
          name_translations,
          slug_translations,
          description_translations,
          profile_image,
          banner_image
        ),
        id,
        name_translations,
        description_translations,
        address,
        city,
        state,
        country,
        latitude,
        longitude,
        status
      `
      )
      .eq("profiles.type", "vendor")
      .eq("profiles.is_active", true)
      .eq("profiles.is_reviewed", true)
      .eq("profiles.is_deleted", false)
      .eq("is_deleted", false)
      .eq("status", "published")
      .limit(parseInt(limit));

    if (error) {
      console.error("Error fetching profiles:", error);
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
    }

    // Transform the data to match the RPC function structure
    const transformedData = (data as unknown as KiosqWithProfile[]).map((kiosq) => ({
      profile_id: kiosq.profile_id.id,
      profile_name: kiosq.profile_id.name_translations as Record<string, string>,
      profile_slug: kiosq.profile_id.slug_translations as Record<string, string>,
      profile_description: kiosq.profile_id.description_translations as Record<string, string>,
      profile_image: kiosq.profile_id.profile_image,
      profile_banner_image: kiosq.profile_id.banner_image,
      kiosq_id: kiosq.id,
      kiosq_name: kiosq.name_translations as Record<string, string>,
      kiosq_description: kiosq.description_translations as Record<string, string>,
      kiosq_address: kiosq.address,
      kiosq_city: kiosq.city,
      kiosq_state: kiosq.state,
      kiosq_country: kiosq.country,
      kiosq_latitude: kiosq.latitude || 0,
      kiosq_longitude: kiosq.longitude || 0,
      kiosq_status: kiosq.status || "published",
      distance_km: 0, // Default distance for fallback
    }));

    return NextResponse.json(closestVendorProfilesFactory(transformedData));
  } catch (error) {
    console.error("Error in vendors API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
