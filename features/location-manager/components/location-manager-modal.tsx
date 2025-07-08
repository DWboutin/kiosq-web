"use client";

import { Controller } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Modal, ModalRef } from "@/components/ui/modal";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useLocationManagerModal } from "@/features/location-manager/hooks/use-location-manager-modal";
import { forwardRef } from "react";

interface LocationManagerModalProps {
  children?: React.ReactNode;
}

export const LocationManagerModal = forwardRef<ModalRef, LocationManagerModalProps>((_, ref) => {
  const t = useTranslations("LocationManager");

  const {
    selectors: { control, errors, isSubmitting },
    actions: { handleFormSubmit, handleCloseModal },
  } = useLocationManagerModal();

  return (
    <Modal
      ref={ref}
      title={t("modalTitle")}
      description={t("modalDescription")}
      confirmLabel={t("modalConfirmLabel")}
      cancelLabel={t("modalCancelLabel")}
      action={async (e) => {
        e.preventDefault();
        await handleFormSubmit(e);
      }}
      closeAction={handleCloseModal}
      loading={isSubmitting}
      content={
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormInputContainer
            inputId="streetAddress"
            label={t("streetAddress")}
            error={errors.streetAddress?.message}
            required
          >
            <Controller
              name="streetAddress"
              control={control}
              render={({ field }) => (
                <Input
                  id="streetAddress"
                  placeholder={t("streetAddressPlaceholder")}
                  aria-invalid={!!errors.streetAddress}
                  {...field}
                />
              )}
            />
          </FormInputContainer>

          <FormInputContainer
            inputId="city"
            label={t("city")}
            error={errors.city?.message}
            required
          >
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  id="city"
                  placeholder={t("cityPlaceholder")}
                  aria-invalid={!!errors.city}
                  {...field}
                />
              )}
            />
          </FormInputContainer>

          <div className="flex gap-2">
            <FormInputContainer
              inputId="postalCode"
              label={t("postalCode")}
              error={errors.postalCode?.message}
              required
              className="flex-1"
            >
              <Controller
                name="postalCode"
                control={control}
                render={({ field }) => (
                  <Input
                    id="postalCode"
                    placeholder={t("postalCodePlaceholder")}
                    aria-invalid={!!errors.postalCode}
                    {...field}
                  />
                )}
              />
            </FormInputContainer>

            <FormInputContainer
              inputId="state"
              label={t("state")}
              error={errors.state?.message}
              required
              className="flex-1"
            >
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Input
                    id="state"
                    placeholder={t("statePlaceholder")}
                    aria-invalid={!!errors.state}
                    {...field}
                  />
                )}
              />
            </FormInputContainer>

            <FormInputContainer
              inputId="country"
              label={t("country")}
              error={errors.country?.message}
              required
              className="flex-1"
            >
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Input
                    id="country"
                    placeholder={t("countryPlaceholder")}
                    aria-invalid={!!errors.country}
                    maxLength={2}
                    {...field}
                  />
                )}
              />
            </FormInputContainer>
          </div>

          <FormInputContainer
            inputId="radiusKm"
            label={t("radiusKm")}
            error={errors.radiusKm?.message}
            description={t("radiusDescription")}
            required
          >
            <Controller
              name="radiusKm"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Slider
                    id="radiusKm"
                    min={50}
                    max={300}
                    step={10}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    aria-invalid={!!errors.radiusKm}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>50 km</span>
                    <span className="font-medium">
                      {t("searchRadius", { radius: field.value })}
                    </span>
                    <span>300 km</span>
                  </div>
                </div>
              )}
            />
          </FormInputContainer>
        </form>
      }
    />
  );
});

LocationManagerModal.displayName = "LocationManagerModal";
