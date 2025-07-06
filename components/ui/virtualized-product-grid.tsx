"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useRef, useEffect, useState, useCallback } from "react";
import { CardProduct } from "@/components/ui/card-product";
import { ProductWithVariantsAndPrices } from "@/utils/factories/product-factory";
import { cn } from "@/lib/utils";

type VirtualizedProductGridProps = {
  products: ProductWithVariantsAndPrices[];
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  className?: string;
};

export const VirtualizedProductGrid = ({
  products,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  className,
}: VirtualizedProductGridProps) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [itemsPerRow, setItemsPerRow] = useState(4);

  // Calculate items per row based on screen size
  const getItemsPerRow = useCallback(() => {
    if (typeof window === "undefined") return 4;
    const width = window.innerWidth;
    if (width < 640) return 1; // sm
    if (width < 768) return 2; // md
    if (width < 1024) return 3; // lg
    return 4; // xl and above
  }, []);

  // Update items per row on window resize
  useEffect(() => {
    const updateItemsPerRow = () => {
      setItemsPerRow(getItemsPerRow());
    };

    updateItemsPerRow();
    window.addEventListener("resize", updateItemsPerRow);
    return () => window.removeEventListener("resize", updateItemsPerRow);
  }, [getItemsPerRow]);

  const totalRows = Math.ceil(products.length / itemsPerRow);

  const virtualizer = useWindowVirtualizer({
    count: totalRows,
    estimateSize: () => 400, // Estimated height of each row (card height + gap)
    overscan: 2,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  });

  // Load more when approaching the end
  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    if (
      virtualItems.length > 0 &&
      virtualItems[virtualItems.length - 1].index >= totalRows - 2 &&
      hasNextPage &&
      !isFetchingNextPage &&
      onLoadMore
    ) {
      onLoadMore();
    }
  }, [virtualizer.getVirtualItems(), totalRows, hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div className={cn(className)}>
      <div ref={listRef} className="w-full">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const rowStartIndex = virtualRow.index * itemsPerRow;
            const rowProducts = products.slice(rowStartIndex, rowStartIndex + itemsPerRow);

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                }}
              >
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                  {rowProducts.map((product) => (
                    <CardProduct
                      key={product.id}
                      id={product.id}
                      title={product.nameTranslations.fr}
                      description={product.descriptionTranslations.fr}
                      status={product.status}
                      variants={product.productVariants}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};
