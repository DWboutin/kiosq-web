import { Locales } from "@/types/app";
import { productCategoriesFactory } from "@/utils/factories/product-categories-factory";
import { cacheKeys } from "@/utils/cache-keys";

export const getProductCategories = async (locale: Locales) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_CURRENT_ORIGIN || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/categories`, {
      next: {
        revalidate: cacheKeys.productCategories.list.revalidate,
        tags: [cacheKeys.productCategories.list.tag],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product categories");
    }

    const data = await response.json();

    return productCategoriesFactory(data.categories, locale);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    throw new Error("Failed request for product categories");
  }
};
