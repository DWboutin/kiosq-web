import { authenticatedUserProductFactory } from "@/utils/factories/authenticated-user-product-factory";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) => {
  try {
    const { productId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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
          )
        `
      )
      .eq("id", productId)
      .single();

    if (productError) {
      console.error(`Error fetching product id ${productId}`, productError);
      return NextResponse.json(
        { error: `Error fetching product id ${productId}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      product: authenticatedUserProductFactory(product),
    });
  } catch (error) {
    console.error("Error fetching product", error);
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 });
  }
};
