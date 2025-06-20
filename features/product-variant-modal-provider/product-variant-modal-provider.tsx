"use client";

import { ProductVariantValues } from "@/components/ui/card-admin-product-variant";
import { ModalRef } from "@/components/ui/modal";
import { useProductVariantModal } from "@/features/product-variant-modal-provider/hooks/use-product-variant-modal";
import { ProductVariantModal } from "@/features/product-variant-modal-provider/product-variant-modal";
import { createContext, useContext, ReactNode } from "react";

type ProductVariantModalContextValues = {
  modalRef: React.RefObject<ModalRef | null>;
  variantValues: ProductVariantValues | null;
  handleSetVariantValues: (values: ProductVariantValues) => void;
};

const ProductVariantModalContext = createContext({} as ProductVariantModalContextValues);

export const useProductVariantModalContext = () => {
  const context = useContext(ProductVariantModalContext);

  if (context === undefined) {
    throw new Error(
      "useProductVariantModalContext must be used within ProductVariantModalProvider"
    );
  }

  return context;
};

interface ProductVariantModalProviderProps {
  children: ReactNode;
}

export const ProductVariantModalProvider = ({ children }: ProductVariantModalProviderProps) => {
  const {
    selectors: { modalRef, variantValues },
    actions: { handleSetVariantValues },
  } = useProductVariantModal();

  return (
    <ProductVariantModalContext.Provider
      value={{
        modalRef,
        variantValues,
        handleSetVariantValues,
      }}
    >
      {children}
      <ProductVariantModal />
    </ProductVariantModalContext.Provider>
  );
};
