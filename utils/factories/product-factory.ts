import {
  NameTranslations,
  DescriptionTranslations,
  Locales,
  PublishedStatus,
  RawProductVariant,
  RawProductPrice,
  RawProductWithVariantsAndPricesAndProfile,
  SlugTranslations,
} from "@/types/app";
import { extractTranslations } from "@/utils/extract-translations";
import { productCategoryWithParentFactory } from "@/utils/factories/product-category-with-parent-factory";
import { ProductCategory } from "@/utils/factories/product-category-with-parent-factory";

export type ProductVariant = {
  id: string;
  sku: string | null;
  unit: string;
  quantity: number;
  imageUrl: string | null;
  isDefault: boolean;
  productId: string;
  optionValues: Record<string, unknown>;
};

export type ProductPrice = {
  id: string;
  currency: string;
  basePrice: number;
  variantId: string;
  effectiveTo: string | null;
  discountType: string;
  effectiveFrom: string;
  discountAmount: number;
  isTaxInclusive: boolean;
};

export type ProductVariantWithPrices = ProductVariant & {
  productPrices: ProductPrice[];
};

export type ProductWithVariantsPricesAndProfile = {
  id: string;
  categoryId: string;
  nameTranslations: NameTranslations;
  descriptionTranslations: DescriptionTranslations;
  isFeatured: boolean;
  profileId: string;
  checklistTranslations: Record<Locales, string>[];
  status: PublishedStatus;
  category: ProductCategory;
  productVariants: ProductVariantWithPrices[];
  profileImageUrl: string | null;
  profileNameTranslations: NameTranslations;
  profileSlugTranslations: SlugTranslations;
};

export const productFactory = (
  product: RawProductWithVariantsAndPricesAndProfile
): ProductWithVariantsPricesAndProfile => {
  const nameTranslations = extractTranslations(product, "name_translations");
  const descriptionTranslations = extractTranslations(product, "description_translations");

  let checklistTranslations: Record<Locales, string>[] = [];
  if (Array.isArray(product.checklist_translations)) {
    checklistTranslations = product.checklist_translations.filter(
      (item): item is Record<Locales, string> =>
        typeof item === "object" && item !== null && ("en" in item || "fr" in item)
    );
  }

  const status: PublishedStatus | undefined =
    "status" in product ? (product.status as PublishedStatus) : undefined;

  return {
    id: product.id,
    categoryId: product.category_id ?? "",
    nameTranslations,
    descriptionTranslations,
    isFeatured: !!product.is_featured,
    profileId: product.profile_id,
    checklistTranslations,
    status: status ?? "draft",
    category: productCategoryWithParentFactory(product.categories),
    productVariants: Array.isArray(product.product_variants)
      ? product.product_variants.map((variant) => {
          const v = variant as RawProductVariant & { product_prices: RawProductPrice[] };
          return {
            id: v.id,
            sku: v.sku ?? null,
            unit: v.unit ?? "",
            quantity: v.quantity ?? 0,
            imageUrl: v.image_url ?? null,
            isDefault: !!v.is_default,
            productId: v.product_id,
            optionValues: (v.option_values ?? {}) as Record<string, unknown>,
            productPrices: Array.isArray(v.product_prices)
              ? v.product_prices.map((price) => {
                  const p = price as RawProductPrice;
                  return {
                    id: p.id,
                    currency: p.currency ?? "",
                    basePrice: p.base_price,
                    variantId: p.variant_id,
                    effectiveTo: p.effective_to,
                    discountType: p.discount_type ?? "",
                    effectiveFrom: p.effective_from,
                    discountAmount: p.discount_amount ?? 0,
                    isTaxInclusive: !!p.is_tax_inclusive,
                  };
                })
              : [],
          };
        })
      : [],
    profileImageUrl: product.profiles.profile_image,
    profileNameTranslations: product.profiles.name_translations,
    profileSlugTranslations: product.profiles.slug_translations,
  };
};

export const productsFactory = (products: RawProductWithVariantsAndPricesAndProfile[]) => {
  return products.map((product) => productFactory(product));
};
