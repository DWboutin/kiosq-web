"use server";

import { productRevalidator } from "@/actions/revalidators/product-revalidator";
import { ProductFormValues } from "@/features/product-form-drawer/utils/product-form-validation-schema";
import { InsertWithLocale } from "@/types/app";
import { createClient } from "@/utils/supabase/server";

type AddProductArgs = InsertWithLocale<ProductFormValues>;

export const createProduct = async (product: AddProductArgs) => {
  const supabase = await createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error("User not found");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("type", "vendor")
    .eq("user_id", user.user.id)
    .single();

  if (profileError) {
    throw profileError;
  }
  if (!profile) {
    throw new Error("Profile not found");
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .insert({
      name_translations: {
        [product.locale]: product.name,
        ...product.name_translations,
      },
      description_translations: {
        [product.locale]: product.description,
        ...product.description_translations,
      },
      category_id: product.subcategory,
      checklist_translations: product.checklist.map((item) => ({
        [product.locale]: item.value,
        ...item.value_translations,
      })),
      profile_id: profile.id,
    })
    .select()
    .single();

  if (productError) {
    throw productError;
  }

  const { data: productVariantData, error: productVariantError } = await supabase
    .from("product_variants")
    .insert({
      product_id: productData.id,
      is_default: true,
      quantity: product.quantity,
      unit: product.unit,
    })
    .select()
    .single();

  if (productVariantError) {
    throw productVariantError;
  }

  const { data: productPriceData, error: productPriceError } = await supabase
    .from("product_prices")
    .insert({
      variant_id: productVariantData.id,
      base_price: parseFloat(Number(product.price).toFixed(2)),
      currency: "CAD",
    })
    .select()
    .single();

  if (productPriceError) {
    throw productPriceError;
  }

  productRevalidator({
    productId: productData.id,
    profileId: profile.id,
    slugTranslations: productData.slug_translations,
  });

  return {
    product: productData,
    productVariant: productVariantData,
    productPrice: productPriceData,
  };
};
