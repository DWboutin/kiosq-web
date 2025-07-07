import { cacheKeys } from "@/utils/cache-keys";
import { ProductWithVariantsAndPrices } from "@/utils/factories/product-factory";
import {
  getProductFromVendorId,
  GetProductFromVendorIdResponse,
} from "@/utils/requests/get-product-from-vendor-id";
import { useInfiniteQuery } from "@tanstack/react-query";

type UseVendorProductInfiniteListProps = {
  initialProductsResponse: GetProductFromVendorIdResponse;
  vendorId: string;
};

export const useVendorProductInfiniteList = ({
  initialProductsResponse,
  vendorId,
}: UseVendorProductInfiniteListProps) => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: cacheKeys.vendorProfileProducts(vendorId).queryKey,
      initialPageParam: 0,
      getNextPageParam: (lastPage: GetProductFromVendorIdResponse) => {
        return lastPage.pagination.hasNextPage ? lastPage.pagination.currentPage + 1 : undefined;
      },
      initialData: {
        pages: [initialProductsResponse],
        pageParams: [0],
      },
      queryFn: ({ pageParam = 0 }) => {
        return getProductFromVendorId({ vendorId: vendorId, limit: 10, skip: pageParam * 10 });
      },
    });

  const allProducts = data?.pages.flatMap((page) => page.products) ?? [];

  return {
    selectors: {
      products: allProducts,
      isLoading,
      isError,
      hasNextPage,
      isFetchingNextPage,
    },
    actions: {
      fetchNextPage,
    },
  };
};
