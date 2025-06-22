import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Locales } from "@/types/app";
import { PRODUCT_CATEGORIES } from "@/utils/constants";
import { ProductCategory } from "@/utils/factories/product-category-with-parent-factory";
import { useLocale } from "next-intl";
import { useMemo } from "react";

type BadgeCategoryProps = {
  className?: string;
  productCategory: ProductCategory;
};

export const BadgeCategory = ({ className, productCategory }: BadgeCategoryProps) => {
  const locale = useLocale() as Locales;
  const category =
    PRODUCT_CATEGORIES[
      (productCategory.parentCategory?.slugTranslations.en ||
        productCategory.slugTranslations.en) as keyof typeof PRODUCT_CATEGORIES
    ];
  const categoryName = useMemo(() => {
    if (!productCategory.parentCategory) {
      return productCategory.nameTranslations[locale];
    }
    return `${productCategory.parentCategory.nameTranslations[locale]} - ${productCategory.nameTranslations[locale]}`;
  }, [productCategory]);
  const Icon = category.icon;

  return (
    <Badge
      className={cn(
        "w-fit cursor-default",
        category.backgroundColor,
        category.contentColor,
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {categoryName}
    </Badge>
  );
};
