import { productFactory } from "@/utils/factories/product-factory";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) => {
  try {
    const { productId } = await params;

    const supabase = await createClient();

    // Fetch single product by ID
    const { data: product, error: productError } = await supabase
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
      .eq("id", productId)
      .eq("status", "published")
      .eq("is_deleted", false)
      .single();

    if (productError) {
      console.error(`Error fetching product ${productId}`, productError);
      return NextResponse.json({ error: `Product not found` }, { status: 404 });
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      product: productFactory(product),
    });
  } catch (error) {
    console.error("Error fetching product", error);
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 });
  }
};
