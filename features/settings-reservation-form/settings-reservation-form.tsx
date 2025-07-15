"use client";

import { ButtonBrand } from "@/components/ui/button-brand";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { StripeConnect } from "@/features/stripe-connect/stripe-connect";

export const SettingsReservationForm = () => {
  const t = useTranslations("SettingsReservationForm");
  const {
    selectors: { profiles },
  } = useCurrentUserProfiles();
  const {
    control,
    formState: { errors },
    watch,
  } = useForm<{
    isReservationEnabled: boolean;
  }>({
    defaultValues: {
      isReservationEnabled: false,
    },
  });
  const isReservationEnabled = watch("isReservationEnabled");
  const vendorProfile = profiles.find((profile) => profile.type === "vendor");

  return (
    <div className="flex flex-col gap-4">
      <FormInputContainer
        inputId="isReservationEnabled"
        label={t("isReservationEnabled")}
        description={t("isReservationEnabledDescription")}
        error={errors.isReservationEnabled?.message}
        required
      >
        <div className="flex flex-row gap-4 items-center mt-2">
          <Controller
            name="isReservationEnabled"
            control={control}
            render={({ field }) => (
              <Switch
                id="isDefault"
                className="data-[state=checked]:bg-brand-medium"
                checked={field.value || false}
                onCheckedChange={field.onChange}
                disabled={!vendorProfile}
              />
            )}
          />
          {!vendorProfile && (
            <ButtonBrand variant="secondary" size="sm" asChild>
              <Link href="/dashboard/your-store">{t("createAVendorProfile")}</Link>
            </ButtonBrand>
          )}
        </div>
      </FormInputContainer>

      {isReservationEnabled && (
        <>
          <Separator orientation="horizontal" />
          <StripeConnect />
        </>
      )}
    </div>
  );
};
