"use client";

import { ButtonBrand } from "@/components/ui/button-brand";
import { ModalRef } from "@/components/ui/modal";
import { useProductDetailsContext } from "@/features/product-details/product-details-provider";
import { ReservationButtonModal } from "@/features/reservation-button/components/reservation-button-modal";
import { useProductById } from "@/hooks/use-product-by-id";
import {
  ProductVariantWithPrices,
  ProductWithVariantsPricesAndProfile,
} from "@/utils/factories/product-factory";
import { createContext, useContext, useRef } from "react";
import { useTranslations } from "next-intl";

interface ReservationButtonContextValues {
  modalRef: React.RefObject<ModalRef | null>;
  product: ProductWithVariantsPricesAndProfile | null;
  selectedVariant: ProductVariantWithPrices;
}

const ReservationButtonContext = createContext({} as ReservationButtonContextValues);

export const useReservationButtonContext = () => {
  const context = useContext(ReservationButtonContext);
  const t = useTranslations("ReservationButton");

  if (context === undefined) {
    throw new Error(t("contextError"));
  }

  return context;
};

export const ReservationButton = () => {
  const t = useTranslations("ReservationButton");
  const modalRef = useRef<ModalRef | null>(null);
  const { selectedVariant } = useProductDetailsContext();
  const {
    selectors: { product = null, isLoading, error },
  } = useProductById(selectedVariant.productId);

  const handleOpenModal = async () => {
    modalRef.current?.open();
  };

  return (
    <ReservationButtonContext.Provider value={{ modalRef, product, selectedVariant }}>
      <ButtonBrand onClick={handleOpenModal} disabled={isLoading || !!error}>
        {t("buttonText")}
      </ButtonBrand>
      <ReservationButtonModal />
    </ReservationButtonContext.Provider>
  );
};
