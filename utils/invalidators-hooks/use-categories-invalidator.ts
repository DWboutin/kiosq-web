import { cacheKeys } from "@/utils/cache-keys";
import { useQueryClient } from "@tanstack/react-query";

export const useCategoriesInvalidator = () => {
  const queryClient = useQueryClient();

  const revalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: [cacheKeys.productCategories.list.queryKey],
    });
  };

  return { revalidate };
};
