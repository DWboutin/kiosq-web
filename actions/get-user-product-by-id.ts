import { authenticatedUserProductFactory } from "@/utils/factories/authenticated-user-product-factory";
import { createClient } from "@/utils/supabase/server";

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

    const { data: product, error: productError } = await supabase
      .from("products")
      .select(
        `
      *,
      categories (
        *
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
      console.error("Error fetching product", productError);
      throw new Error("Error fetching product");
    }

    return authenticatedUserProductFactory(product);
  } catch (error) {
    console.error("Error fetching product", error);
    throw new Error("Error fetching product");
  }
};
