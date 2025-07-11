import { cacheKeys } from "@/utils/cache-keys";
import { useQueryClient } from "@tanstack/react-query";

export const useProductsInvalidator = () => {
  const queryClient = useQueryClient();

  const invalidate = async ({
    productId,
    profileId,
  }: {
    productId: string;
    profileId?: string;
  }) => {
    await queryClient.invalidateQueries({
      queryKey: cacheKeys.currentUserProductById(productId).queryKey,
    });
    await queryClient.invalidateQueries({
      queryKey: cacheKeys.relatedProducts(productId).queryKey,
    });

    if (profileId) {
      await queryClient.invalidateQueries({
        queryKey: cacheKeys.currentUserProfileIdProducts.list(profileId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: cacheKeys.vendorProfileProducts(profileId).queryKey,
      });
    }
  };

  return { invalidate };
};
