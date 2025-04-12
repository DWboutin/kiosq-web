import { FC, memo } from "react";
import { PRODUCT_CATEGORIES } from "@/utils/constants";

type ProductCategoryCardProps = {
  category: keyof typeof PRODUCT_CATEGORIES;
};

export const ProductCategoryCard: FC<ProductCategoryCardProps> = memo(({ category }) => {
  const categoryData = PRODUCT_CATEGORIES[category];
  const Icon = categoryData.icon;

  return (
    <div
      aria-label={categoryData.text}
      className={`flex h-full w-full flex-col items-center justify-center rounded-2xl p-2.5 transition-colors hover:opacity-90 ${categoryData.backgroundColor}`}
    >
      <div className="mb-2 h-8 w-8">
        <Icon className={categoryData.contentColor} />
      </div>
      <p className={`text-center text-xs font-semibold ${categoryData.contentColor}`}>
        {categoryData.text}
      </p>
    </div>
  );
});

ProductCategoryCard.displayName = "ProductCategoryCard";
