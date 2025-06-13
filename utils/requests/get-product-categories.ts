import { Locales } from "@/types/app";
import { adminProductCategoriesFactory } from "@/utils/factories/admin-product-categories-factory";
import { cacheKeys } from "@/utils/cache-keys";
import { getBaseUrl } from "@/utils/get-base-url";

export const getProductCategories = async (locale: Locales) => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/categories`, {
      next: {
        revalidate: cacheKeys.productCategories.list.revalidate,
        tags: [cacheKeys.productCategories.list.tag],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product categories");
    }

    const data = await response.json();

    return adminProductCategoriesFactory(data.categories, locale);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    throw new Error("Failed request for product categories");
  }
};
