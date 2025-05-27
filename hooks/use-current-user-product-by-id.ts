import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserProductById } from "@/utils/requests/get-authenticated-user-profile-id-product-by-id";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserProductById(productId: string) {
  const {
    data: product = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserProductById(productId).queryKey,
    queryFn: () => getAuthenticatedUserProductById(productId),
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
