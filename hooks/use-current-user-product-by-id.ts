import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserProductById } from "@/utils/requests/get-authenticated-user-profile-id-product-by-id";
import { AuthenticatedUserProductWithVariantsAndPrices } from "@/utils/factories/authenticated-user-product-factory";
import { useQuery } from "@tanstack/react-query";

type UseCurrentUserProductByIdProps = {
  productData?: AuthenticatedUserProductWithVariantsAndPrices;
  productId?: string;
};

export function useCurrentUserProductById({
  productData,
  productId,
}: UseCurrentUserProductByIdProps) {
  const queryProductId = (productData?.id || productId) as string;
  const {
    data: product = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserProductById(queryProductId).queryKey,
    queryFn: () => getAuthenticatedUserProductById(queryProductId),
    initialData: productData,
    enabled: !!queryProductId,
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
