import { FC, useEffect } from "react";
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { UserOnboardingValues } from "../schemas/user-onboarding-schema";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapPin, Mail } from "lucide-react";
import { UserGeolocation } from "@/utils/get-geolocation";
import { cn } from "@/lib/utils";

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
        <p className="text-sm text-muted-foreground">
          We need your location to show you relevant content nearby. You can either:
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            className={cn(
              "flex-1 gap-2 justify-center",
              useGeolocation && "cursor-default hover:bg-brand-medium"
            )}
            onClick={onRequestGeolocation}
            variant={useGeolocation ? "default" : "outline"}
          >
            <MapPin size={16} />
            {useGeolocation ? "Geolocation Enabled" : "Enable Geolocation"}
          </Button>

          {!useGeolocation && (
            <Button type="button" className="flex-1 gap-2 justify-center" variant="outline">
              <Mail size={16} />
              Use Postal Code
            </Button>
          )}
        </div>
      </div>

      {!useGeolocation && (
        <FormInputContainer
          inputId="postalCode"
          label="Postal Code"
          error={errors.postalCode?.message}
          required={!useGeolocation}
        >
          <Controller
            name="postalCode"
            control={control}
            render={({ field }) => (
              <Input
                id="postalCode"
                placeholder="Enter your postal code"
                aria-invalid={!!errors.postalCode}
                {...field}
              />
            )}
          />
          <div className="text-sm text-muted-foreground mt-1">
            We&apos;ll use this to find relevant content in your area
          </div>
        </FormInputContainer>
      )}

      <div className="space-y-4">
        <FormInputContainer
          inputId="searchRadius"
          label={`Search Radius (${searchRadius} km)`}
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
