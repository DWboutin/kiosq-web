"use client";

import { ButtonBrand } from "@/components/ui/button-brand";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

export const SettingsReservationForm = () => {
  const t = useTranslations("SettingsReservationForm");
  const {
    selectors: { profiles },
  } = useCurrentUserProfiles();
  const {
    control,
    formState: { errors },
  } = useForm<{
    isReservationEnabled: boolean;
  }>({
    defaultValues: {
      isReservationEnabled: false,
    },
  });
  const vendorProfile = profiles.find((profile) => profile.type === "vendor");
  console.log(vendorProfile);

  return (
    <div className="flex flex-col items-center gap-4">
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
      <Separator orientation="horizontal" />
    </div>
  );
};
