import { Modal } from "@/components/ui/modal";
import { ReservationButtonModalForm } from "@/features/reservation-button/components/reservation-button-modal-form";
import { useReservationButtonContext } from "@/features/reservation-button/reservation-button";
import { Locales } from "@/types/app";
import { useLocale, useTranslations } from "next-intl";

export const ReservationButtonModal = () => {
  const t = useTranslations("ReservationButton");
  const locale = useLocale() as Locales;
  const { modalRef, product, selectedVariant } = useReservationButtonContext();

  if (!product) {
    return null;
  }

  return (
    <Modal
      ref={modalRef}
      title={t("modalTitle", {
        productName: product.nameTranslations[locale],
        variantName: `${selectedVariant.quantity}${selectedVariant.unit}`,
      })}
      description={t("modalDescription", {
        profileName: product.profileNameTranslations[locale],
      })}
      confirmLabel={t("modalConfirmLabel")}
      cancelLabel={t("modalCancelLabel")}
      action={async () => {}}
      isDestructive={false}
      closeAction={() => {}}
      content={<ReservationButtonModalForm />}
    />
  );
};
