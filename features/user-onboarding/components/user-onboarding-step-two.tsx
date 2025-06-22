import { FC, useEffect } from "react";
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { UserOnboardingValues } from "../utils/create-user-onboarding-schema";
import { Slider } from "@/components/ui/slider";
import { MapPin } from "lucide-react";
import { UserGeolocation } from "@/utils/get-geolocation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";
import { ButtonBrand } from "@/components/ui/button-brand";

interface UserOnboardingStepTwoProps {
  control: Control<UserOnboardingValues>;
  errors: FieldErrors<UserOnboardingValues>;
  onRequestGeolocation: () => Promise<UserGeolocation | null>;
}

export const UserOnboardingStepTwo: FC<UserOnboardingStepTwoProps> = ({
  control,
  errors,
  onRequestGeolocation,
}) => {
  const t = useTranslations("UserOnboarding");
  const useGeolocation = useWatch({
    control,
    name: "useGeolocation",
  });

  const searchRadius = useWatch({
    control,
    name: "searchRadius",
  });

  // Check if geolocation is already enabled when component mounts
  useEffect(() => {
    // First check if geolocation is supported by the browser
    if (navigator.geolocation) {
      // Try to get the user's position without requesting permission yet
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
          if (permissionStatus.state === "granted") {
            // If permission already granted, request geolocation
            onRequestGeolocation();
          }
        })
        .catch(() => {
          // If permission query fails, do nothing (we'll ask for permission later)
        });
    }
  }, [onRequestGeolocation]);

  return (
    <div className="grid w-full items-center gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonBrand
            type="button"
            className={cn(
              "flex-1 gap-2 justify-center",
              useGeolocation && "cursor-default hover:bg-brand-medium"
            )}
            onClick={onRequestGeolocation}
            variant={useGeolocation ? "default" : "outline"}
            autoFocus={!useGeolocation}
          >
            <MapPin size={16} />
            {useGeolocation ? t("geolocationEnabled") : t("enableGeolocation")}
          </ButtonBrand>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">{t("orEnterPostalCode")}</span>
        <Separator className="flex-1" />
      </div>

      {!useGeolocation && (
        <FormInputContainer
          inputId="postalCode"
          label={t("postalCode")}
          error={errors.postalCode?.message}
          required={!useGeolocation}
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
      )}

      <div className="space-y-4">
        <FormInputContainer
          inputId="searchRadius"
          label={t("searchRadius", { km: searchRadius })}
          error={errors.searchRadius?.message}
          required
        >
          <Controller
            name="searchRadius"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Slider
                min={50}
                max={400}
                step={1}
                value={[value]}
                onValueChange={(vals) => onChange(vals[0])}
              />
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>50 km</span>
            <span>400 km</span>
          </div>
        </FormInputContainer>
      </div>
    </div>
  );
};
