import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_deleted", false)
      .order("order_rank", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Error fetching categories", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { categories },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
          "CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
          "Vercel-CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
          "x-cache-tags": "categories",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error in categories API:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
};
