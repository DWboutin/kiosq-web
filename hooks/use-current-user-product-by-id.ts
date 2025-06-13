import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserProductById } from "@/utils/requests/get-authenticated-user-profile-id-product-by-id";
import { AuthenticatedUserProductWithVariantsAndPrices } from "@/utils/factories/authenticated-user-product-factory";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserProductById(
  productData: AuthenticatedUserProductWithVariantsAndPrices
) {
  const {
    data: product = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserProductById(productData.id).queryKey,
    queryFn: () => getAuthenticatedUserProductById(productData.id),
    initialData: productData,
  });

  return {
    selectors: {
      product,
      isLoading,
      error,
    },
    actions: {
      refetch,
    },
  };
}
