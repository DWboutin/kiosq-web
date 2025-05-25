import { useQuery } from "@tanstack/react-query";
import { Locales } from "@/types/app";
import { getProductCategories } from "@/utils/requests/get-product-categories";
import { FormattedProductCategory } from "@/utils/factories/admin-product-categories-factory";
import { useLocale } from "next-intl";
import { cacheKeys } from "@/utils/cache-keys";

export interface ProductCategoriesSelectors {
  categories?: FormattedProductCategory[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

export interface ProductCategoriesActions {
  refetch: () => Promise<unknown>;
}

export interface ProductCategoriesHook {
  selectors: ProductCategoriesSelectors;
  actions: ProductCategoriesActions;
}

export function useProductCategories(): ProductCategoriesHook {
  const locale = useLocale() as Locales;
  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.productCategories.listByLocale(locale).queryKey,
    queryFn: () => getProductCategories(locale),
  });

  return {
    selectors: {
      categories,
      isLoading,
      isError,
      error,
    },
    actions: {
      refetch,
    },
  };
}
