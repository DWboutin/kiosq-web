import { Locales, RawProductCategoryWithParent, RawProductCategory } from "@/types/app";

export type ProductCategory = {
  id: string;
  isActive: boolean;
  isDeleted: boolean;
  parentCategory: ProductCategory | null;
  nameTranslations: Record<Locales, string>;
  descriptionTranslations: Record<Locales, string>;
  slugTranslations: Record<Locales, string>;
};

const hasParentCategory = (
  category: RawProductCategoryWithParent | RawProductCategory
): category is RawProductCategoryWithParent => {
  return "parent_category" in category;
};

export const productCategoryWithParentFactory = (
  category: RawProductCategoryWithParent | RawProductCategory
): ProductCategory => {
  return {
    id: category.id,
    isActive: category.is_active,
    isDeleted: category.is_deleted,
    parentCategory:
      hasParentCategory(category) && category.parent_category
        ? productCategoryWithParentFactory(category.parent_category)
        : null,
    nameTranslations: category.name_translations as Record<Locales, string>,
    descriptionTranslations: category.description_translations as Record<Locales, string>,
    slugTranslations: category.slug as Record<Locales, string>,
  };
};
