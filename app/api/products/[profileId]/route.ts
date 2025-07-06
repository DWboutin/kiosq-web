import { productsFactory } from "@/utils/factories/product-factory";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) => {
  try {
    const { profileId } = await params;
    const { searchParams } = new URL(request.url);

    // Get pagination parameters from query string
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json({ error: "Limit must be between 1 and 100" }, { status: 400 });
    }

    if (skip < 0) {
      return NextResponse.json({ error: "Skip must be non-negative" }, { status: 400 });
    }

    const supabase = await createClient();

    // Calculate range indices for Supabase
    const from = skip;
    const to = skip + limit - 1;

    // Fetch products with pagination
    const {
      data: products,
      error: productsError,
      count,
    } = await supabase
      .from("products")
      .select(
        `
          *,
          categories (
            *,
            parent_category:parent_id(*)
          ),
          product_variants (
            *,
            product_prices(*)
          )
        `,
        { count: "exact" }
      )
      .eq("profile_id", profileId)
      .eq("status", "published")
      .eq("is_deleted", false)
      .range(from, to);

    if (productsError) {
      console.error(`Error fetching products for profile ${profileId}`, productsError);
      return NextResponse.json(
        { error: `Error fetching products for profile ${profileId}` },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(skip / limit) + 1;
    const hasNextPage = skip + limit < totalItems;
    const hasPrevPage = skip > 0;

    return NextResponse.json({
      products: productsFactory(products || []),
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        limit,
        skip,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching products", error);
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }
};
