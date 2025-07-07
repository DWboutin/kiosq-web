"use client";

import { VirtualizedProductGrid } from "@/components/ui/virtualized-product-grid";
import { useVendorProductInfiniteList } from "@/features/vendor-products-infinite-list/hooks/use-vendor-product-infinite-list";
import { GetProductFromVendorIdResponse } from "@/utils/requests/get-product-from-vendor-id";

type VendorProductsInfiniteListProps = {
  initialProductsResponse: GetProductFromVendorIdResponse;
  vendorId: string;
};

export const VendorProductsInfiniteList = ({
  initialProductsResponse,
  vendorId,
}: VendorProductsInfiniteListProps) => {
  const {
    selectors: { products, hasNextPage, isFetchingNextPage },
    actions: { fetchNextPage },
  } = useVendorProductInfiniteList({
    initialProductsResponse,
    vendorId,
  });

  return (
    <VirtualizedProductGrid
      products={products}
      onLoadMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
    />
  );
};
