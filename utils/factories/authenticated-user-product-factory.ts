import {
  RawProductWithVariantsAndPrices,
  NameTranslations,
  DescriptionTranslations,
  Locales,
  PublishedStatus,
  RawProductVariant,
  RawProductPrice,
} from "@/types/app";
import { extractTranslations } from "@/utils/extract-translations";
import { productCategoryWithParentFactory } from "@/utils/factories/product-category-with-parent-factory";

export type AuthenticatedUserProductVariant = {
  id: string;
  sku: string | null;
  unit: string;
  quantity: number;
  imageUrl: string | null;
  createdAt: string;
  isDefault: boolean;
  isDeleted: boolean;
  productId: string;
  updatedAt: string;
  updatedBy: string | null;
  optionValues: Record<string, unknown>;
};

export type AuthenticatedUserProductPrice = {
  id: string;
  currency: string;
  basePrice: number;
  createdAt: string;
  updatedAt: string;
  variantId: string;
  effectiveTo: string | null;
  discountType: string;
  effectiveFrom: string;
  discountAmount: number;
  isTaxInclusive: boolean;
};

export type AuthenticatedUserProductWithVariantsAndPrices = {
  id: string;
  categoryId: string;
  nameTranslations: NameTranslations;
  descriptionTranslations: DescriptionTranslations;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  updatedBy: string | null;
  profileId: string;
  checklistTranslations: Record<Locales, string>[];
  status: PublishedStatus;
  productVariants: (AuthenticatedUserProductVariant & {
    productPrices: AuthenticatedUserProductPrice[];
  })[];
};

export const authenticatedUserProductFactory = (
  product: RawProductWithVariantsAndPrices
): AuthenticatedUserProductWithVariantsAndPrices => {
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
    createdAt: product.created_at,
    updatedAt: product.updated_at,
    isDeleted: product.is_deleted,
    updatedBy: product.updated_by ?? null,
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
            createdAt: v.created_at,
            isDefault: !!v.is_default,
            isDeleted: !!v.is_deleted,
            productId: v.product_id,
            updatedAt: v.updated_at,
            updatedBy: v.updated_by ?? null,
            optionValues: (v.option_values ?? {}) as Record<string, unknown>,
            productPrices: Array.isArray(v.product_prices)
              ? v.product_prices.map((price) => {
                  const p = price as RawProductPrice;
                  return {
                    id: p.id,
                    currency: p.currency ?? "",
                    basePrice: p.base_price,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
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
  };
};
