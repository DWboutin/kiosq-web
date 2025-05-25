import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserProfileIdProducts } from "@/utils/requests/get-authenticated-user-profile-id-products";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserProfileIdProducts(profileId: string) {
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserProfileIdProducts.list(profileId).queryKey,
    queryFn: () => getAuthenticatedUserProfileIdProducts(profileId),
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
