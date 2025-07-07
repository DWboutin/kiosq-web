"use client";

import {
  ProductVariantWithPrices,
  ProductWithVariantsPricesAndProfile,
} from "@/utils/factories/product-factory";
import { createContext, useContext, ReactNode, useState } from "react";

interface ProductDetailsContextValues {
  selectedVariant: ProductVariantWithPrices;
  handleSelectVariant: (variant: ProductVariantWithPrices) => void;
}

const ProductDetailsContext = createContext({} as ProductDetailsContextValues);

export const useProductDetailsContext = () => {
  const context = useContext(ProductDetailsContext);

  if (context === undefined) {
    throw new Error("usenameContext must be used within nameProvider");
  }

  return context;
};

interface ProductDetailsProviderProps {
  children: ReactNode;
  product: ProductWithVariantsPricesAndProfile;
}

export const ProductDetailsProvider = ({ children, product }: ProductDetailsProviderProps) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantWithPrices>(
    product.productVariants[0]
  );

  const handleSelectVariant = (variant: ProductVariantWithPrices) => {
    setSelectedVariant(variant);
  };

  return (
    <ProductDetailsContext.Provider
      value={{
        selectedVariant,
        handleSelectVariant,
      }}
    >
      {children}
    </ProductDetailsContext.Provider>
  );
};
