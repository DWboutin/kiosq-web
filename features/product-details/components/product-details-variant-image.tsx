"use client";

import { useProductDetailsContext } from "@/features/product-details/product-details-provider";
import Image from "next/image";

interface ProductDetailsVariantImageProps {
  productName: string;
}

export const ProductDetailsVariantImage = ({ productName }: ProductDetailsVariantImageProps) => {
  const { selectedVariant } = useProductDetailsContext();

  return (
    <div className="flex flex-col gap-4 max-md:w-full max-md:items-center">
      <Image
        src={selectedVariant.imageUrl || "/placeholders/240x140.jpg"}
        alt={productName}
        width={240}
        height={140}
        className="rounded-lg min-md:w-[480px] min-md:max-h-[280px] max-md:max-h-[140px]"
      />
    </div>
  );
};
