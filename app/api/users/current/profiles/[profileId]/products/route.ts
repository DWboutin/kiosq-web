import { authenticatedUserProfileIdProductsFactory } from "@/utils/factories/authenticated-user-profile-id-products-factory";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) => {
  try {
    const { profileId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: products, error: productsError } = await supabase
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
      .eq("profile_id", profileId);

    if (productsError) {
      console.error("Error fetching products", productsError);
      return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
    }

    return NextResponse.json({
      products: authenticatedUserProfileIdProductsFactory(products),
    });
  } catch (error) {
    console.error("Error fetching products", error);
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }
};
