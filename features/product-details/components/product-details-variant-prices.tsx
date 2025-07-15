"use client";

import { useProductDetailsContext } from "@/features/product-details/product-details-provider";
import { ProductVariantWithPrices } from "@/utils/factories/product-factory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductDetailsVariantPricesProps {
  productVariants: ProductVariantWithPrices[];
}

export const ProductDetailsVariantPrices = ({
  productVariants,
}: ProductDetailsVariantPricesProps) => {
  const { selectedVariant, handleSelectVariant } = useProductDetailsContext();

  const handleVariantChange = (variantId: string) => {
    const variant = productVariants.find((v) => v.id === variantId);
    if (variant) {
      handleSelectVariant(variant);
    }
  };

  const getVariantLabel = (variant: ProductVariantWithPrices) => {
    return `${variant.quantity} ${variant.unit}`;
  };

  return (
    <div className="flex flex-row gap-4 items-center">
      <div className="flex flex-row gap-2 items-center">
        <p className="text-xl font-bold text-neutral-black">
          {selectedVariant.productPrices[0].basePrice.toFixed(2)} $
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <Select value={selectedVariant.id} onValueChange={handleVariantChange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {productVariants.map((variant) => (
              <SelectItem key={variant.id} value={variant.id}>
                {getVariantLabel(variant)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
