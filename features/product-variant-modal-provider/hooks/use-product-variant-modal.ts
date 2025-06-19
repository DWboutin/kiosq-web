import { ProductVariantValues } from "@/components/ui/card-admin-product-variant";
import { ModalRef } from "@/components/ui/modal";
import { useEffect, useRef, useState } from "react";

export const useProductVariantModal = () => {
  const modalRef = useRef<ModalRef>(null);
  const [variantValues, setVariantValues] = useState<ProductVariantValues | null>(null);

  const handleSetVariantValues = (values: ProductVariantValues) => {
    setVariantValues(values);
  };

  useEffect(() => {
    if (variantValues !== null) {
      modalRef.current?.open();
    }
  }, [variantValues]);

  return {
    selectors: {
      modalRef,
      variantValues,
    },
    actions: {
      handleSetVariantValues,
    },
  };
};
