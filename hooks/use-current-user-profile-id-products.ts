import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserProfileIdProducts } from "@/utils/requests/get-authenticated-user-profile-id-products";
import { AuthenticatedUserProductWithVariantsAndPrices } from "@/utils/factories/authenticated-user-product-factory";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserProfileIdProducts(
  productsData: AuthenticatedUserProductWithVariantsAndPrices[],
  profileId: string
) {
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserProfileIdProducts.list(profileId).queryKey,
    queryFn: () => getAuthenticatedUserProfileIdProducts(profileId),
    initialData: productsData,
    enabled: !!profileId,
  });

  return {
    selectors: {
      products,
      isLoading,
      error,
    },
    actions: {
      refetch,
    },
  };
}
