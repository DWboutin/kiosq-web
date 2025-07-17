import { Modal } from "@/components/ui/modal";
import { ReservationButtonModalForm } from "@/features/reservation-button/components/reservation-button-modal-form";
import { useReservationButtonContext } from "@/features/reservation-button/reservation-button";
import { useStripePayment } from "@/features/stripe-payment/stripe-payment-provider";
import { createReservationPaymentIntent } from "@/actions/create-reservation-payment-intent";
import { Locales } from "@/types/app";
import { useLocale, useTranslations } from "next-intl";

export const ReservationButtonModal = () => {
  const t = useTranslations("ReservationButton");
  const locale = useLocale() as Locales;
  const { modalRef, product, selectedVariant, purchaseData } = useReservationButtonContext();
  const { setClientSecret } = useStripePayment();

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
      action={async () => {
        if (!product) return;
        try {
          const clientSecret = await createReservationPaymentIntent({
            variantId: selectedVariant.id,
            quantity: purchaseData.quantity,
            kiosqId: purchaseData.kiosqId,
            profileId: product.profileId,
          });
          setClientSecret(clientSecret);
          modalRef.current?.close();
        } catch (error) {
          console.error("Payment intent creation failed:", error);
        }
      }}
      isDestructive={false}
      closeAction={() => {}}
      content={<ReservationButtonModalForm />}
    />
  );
};
