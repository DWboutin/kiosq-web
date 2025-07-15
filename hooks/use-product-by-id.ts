import { cacheKeys } from "@/utils/cache-keys";
import { getProductById } from "@/utils/requests/get-product-by-id";
import { useQuery } from "@tanstack/react-query";

export const useProductById = (productId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: cacheKeys.productById(productId).queryKey,
    queryFn: () => getProductById(productId),
  });

  return {
    selectors: {
      product: data,
      isLoading,
      error,
    },
    actions: {
      refetch,
    },
  };
};
