"use client";

import { useProductDetailsContext } from "@/features/product-details/product-details-provider";
import Image from "next/image";

interface ProductDetailsVariantImageProps {
  productName: string;
}

export const ProductDetailsVariantImage = ({ productName }: ProductDetailsVariantImageProps) => {
  const { selectedVariant } = useProductDetailsContext();

  return (
    <div className="flex flex-col gap-4">
      <Image
        src={selectedVariant.imageUrl || "/placeholders/240x140.jpg"}
        alt={productName}
        width={500}
        height={500}
        className="rounded-lg"
      />
    </div>
  );
};
