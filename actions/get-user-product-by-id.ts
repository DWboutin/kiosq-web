import { authenticatedUserProfileIdProductsFactory } from "@/utils/factories/authenticated-user-profile-id-products-factory";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const getUserProductById = async (productId: string) => {
  try {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user.user) {
      throw new Error("User not found");
    }

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        `
      *,
      product_categories (
        *
      ),
      product_variants (
        *,
        product_prices(*)
      )
    `
      )
      .eq("id", productId);

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
