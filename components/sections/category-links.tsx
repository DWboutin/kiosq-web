import { ProductCategoryCard } from "@/components/ui/product-category-card";
import { Link } from "@/i18n/navigation";
import { CATEGORIES_ORDER } from "@/utils/constants";
import { getTranslations } from "next-intl/server";
export const CategoryLinks = async () => {
  const t = await getTranslations("Categories");

  return (
    <div className="w-full overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-2 pb-4">
      <div className="flex min-w-max px-5 gap-4 mx-auto max-w-max">
        {CATEGORIES_ORDER.map((category) => (
          <Link
            href={category.link}
            key={category.name}
            aria-label={t(category.name)}
            className={`block h-30 w-30 flex-shrink-0 rounded-2xl outline-none transition-all duration-200
              focus:scale-105 focus:ring-4 focus:ring-opacity-50 ring-neutral-lightest`}
          >
            <ProductCategoryCard category={category.name} />
          </Link>
        ))}
      </div>
    </div>
  );
};
