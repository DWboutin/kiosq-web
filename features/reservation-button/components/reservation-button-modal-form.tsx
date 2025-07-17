import { ReservationButtonModalContent } from "@/features/reservation-button/components/reservation-button-modal-content";
import { useReservationButtonContext } from "@/features/reservation-button/reservation-button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useMemo, useEffect } from "react";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { ButtonBrand } from "@/components/ui/button-brand";
import { useTranslations } from "next-intl";
import { ReservationButtonModalKiosqsDropdown } from "@/features/reservation-button/components/reservation-button-modal-kiosqs-dropdown";

export const ReservationButtonModalForm = () => {
  const t = useTranslations("ReservationButton");
  const { selectedVariant, product, setPurchaseData } = useReservationButtonContext();

  const reservationSchema = z.object({
    quantity: z.number().min(1, t("quantityMinError")),
    kiosqId: z.string().min(1, t("kiosqIdRequiredError")),
  });

  type ReservationFormData = z.infer<typeof reservationSchema>;

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      quantity: 1,
      kiosqId: "",
    },
  });

  const quantity = watch("quantity");
  const kiosqId = watch("kiosqId");

  useEffect(() => {
    setPurchaseData({ quantity, kiosqId });
  }, [quantity, kiosqId, setPurchaseData]);

  // Calculate total price based on quantity
  const totalPrice = useMemo(() => {
    if (!selectedVariant.productPrices.length) return 0;
    const price = selectedVariant.productPrices[0];
    const effectivePrice = price.basePrice - price.discountAmount;
    return effectivePrice * quantity;
  }, [selectedVariant.productPrices, quantity]);

  if (!product) {
    return (
      <div className="flex flex-col gap-4">
        <p>{t("productNotFound")}</p>
      </div>
    );
  }

  return (
    <div>
      <ReservationButtonModalContent product={product} variant={selectedVariant} />
      <form className="mt-6 space-y-4">
        <FormInputContainer
          inputId="kiosqId"
          label={t("kiosqLabel")}
          error={errors.kiosqId?.message}
          required
        >
          <Controller
            name="kiosqId"
            control={control}
            render={({ field }) => (
              <ReservationButtonModalKiosqsDropdown
                profileId={product.profileId}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t("selectKiosqPlaceholder")}
              />
            )}
          />
        </FormInputContainer>
        <FormInputContainer
          inputId="quantity"
          label={t("quantityLabel")}
          error={errors.quantity?.message}
          required
        >
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <ButtonBrand
                  type="button"
                  onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
                  disabled={field.value <= 1}
                  tabIndex={0}
                  aria-label={t("decreaseQuantityAriaLabel")}
                  className="h-11 w-11"
                >
                  -
                </ButtonBrand>
                <Input
                  id="quantity"
                  type="number"
                  value={field.value}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    field.onChange(Math.max(1, value));
                  }}
                  min="1"
                  className="text-center text-lg! font-bold w-20 h-11 no-controls"
                  aria-label={t("quantityAriaLabel")}
                  aria-invalid={!!errors.quantity}
                />
                <ButtonBrand
                  type="button"
                  onClick={() => field.onChange((field.value || 1) + 1)}
                  tabIndex={0}
                  aria-label={t("increaseQuantityAriaLabel")}
                  className="h-11 w-11"
                >
                  +
                </ButtonBrand>
              </div>
            )}
          />
        </FormInputContainer>

        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-lg font-semibold">{t("totalPrice")}</span>
          <span className="text-xl font-bold">
            ${totalPrice.toFixed(2)} {selectedVariant.productPrices[0]?.currency || "CAD"}
          </span>
        </div>
      </form>
    </div>
  );
};
