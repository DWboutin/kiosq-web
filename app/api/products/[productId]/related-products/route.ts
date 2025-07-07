import { productsFactory } from "@/utils/factories/product-factory";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) => {
  try {
    const { productId } = await params;
    const { searchParams } = new URL(request.url);

    // Get limit parameter from query string (default to 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate limit parameter
    if (limit < 1 || limit > 50) {
      return NextResponse.json({ error: "Limit must be between 1 and 50" }, { status: 400 });
    }

    const supabase = await createClient();

    // First, get the product and its category information
    const { data: sourceProduct, error: sourceProductError } = await supabase
      .from("products")
      .select(
        `
          id,
          profile_id,
          category_id,
          categories (
            id,
            parent_id
          )
        `
      )
      .eq("id", productId)
      .eq("is_deleted", false)
      .single();

    if (sourceProductError) {
      console.error(`Error fetching source product ${productId}`, sourceProductError);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!sourceProduct || !sourceProduct.categories) {
      return NextResponse.json({ error: "Product or category not found" }, { status: 404 });
    }

    const sourceCategory = Array.isArray(sourceProduct.categories)
      ? sourceProduct.categories[0]
      : sourceProduct.categories;
    const sourceProfileId = sourceProduct.profile_id;

    if (!sourceCategory) {
      return NextResponse.json({ error: "Product category not found" }, { status: 404 });
    }

    // Build the query to find related products
    let query = supabase
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
          ),
          profiles (
            name_translations,
            slug_translations,
            profile_image
          )
        `
      )
      .eq("is_deleted", false)
      .neq("id", productId); // Exclude the source product

    // Apply category filter based on whether we're looking for siblings or same category
    if (sourceCategory.parent_id) {
      // Find products in categories that have the same parent_id
      query = query.eq("categories.parent_id", sourceCategory.parent_id);
    } else {
      // Find products in the same root category
      query = query.eq("category_id", sourceCategory.id);
    }

    // Execute the query with limit
    const { data: relatedProducts, error: relatedProductsError } = await query.limit(limit * 2); // Get more to allow for proper sorting

    if (relatedProductsError) {
      console.error(`Error fetching related products for ${productId}`, relatedProductsError);
      return NextResponse.json({ error: "Error fetching related products" }, { status: 500 });
    }

    if (!relatedProducts || relatedProducts.length === 0) {
      return NextResponse.json({
        products: [],
      });
    }

    // Sort products: same profile first, then others
    const sortedProducts = relatedProducts.sort((a, b) => {
      // First priority: products from the same profile
      if (a.profile_id === sourceProfileId && b.profile_id !== sourceProfileId) {
        return -1;
      }
      if (a.profile_id !== sourceProfileId && b.profile_id === sourceProfileId) {
        return 1;
      }

      // Second priority: by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Limit the final results
    const limitedProducts = sortedProducts.slice(0, limit);

    return NextResponse.json({
      products: productsFactory(limitedProducts),
    });
  } catch (error) {
    console.error("Error fetching related products", error);
    return NextResponse.json({ error: "Error fetching related products" }, { status: 500 });
  }
};
