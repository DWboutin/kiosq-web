import { Locales, ProductCategoryWithTranslations } from "@/types/app";

export type FormattedProductCategory = {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId: string | null;
  imageUrl: string | null;
  orderRank: number | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export const productCategoriesFactory = (
  categories: ProductCategoryWithTranslations[],
  locale: Locales
): FormattedProductCategory[] => {
  return categories.map((category) => ({
    id: category.id,
    name: category.name_translations[locale] || "no translation",
    description: category.description_translations[locale] || "no translation",
    slug: category.slug[locale] || "no translation",
    parentId: category.parent_id,
    imageUrl: category.image_url,
    orderRank: category.order_rank,
    isActive: category.is_active,
    isDeleted: category.is_deleted,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  }));
};
