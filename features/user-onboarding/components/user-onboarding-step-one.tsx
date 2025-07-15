import { FC } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { UserOnboardingValues } from "@/features/user-onboarding/utils/create-user-onboarding-schema";

interface UserOnboardingStepOneProps {
  control: Control<UserOnboardingValues>;
  errors: FieldErrors<UserOnboardingValues>;
}

export const UserOnboardingStepOne: FC<UserOnboardingStepOneProps> = ({ control, errors }) => {
  const t = useTranslations("UserOnboarding");

  return (
    <div className="grid w-full items-center gap-4">
      <FormInputContainer
        inputId="firstName"
        label={t("firstName")}
        error={errors.firstName?.message}
        required
      >
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <Input
              id="firstName"
              placeholder={t("firstNamePlaceholder")}
              aria-invalid={!!errors.firstName}
              autoFocus
              {...field}
            />
          )}
        />
      </FormInputContainer>

      <FormInputContainer
        inputId="lastName"
        label={t("lastName")}
        error={errors.lastName?.message}
        required
      >
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Input
              id="lastName"
              placeholder={t("lastNamePlaceholder")}
              aria-invalid={!!errors.lastName}
              {...field}
            />
          )}
        />
      </FormInputContainer>

      <FormInputContainer
        inputId="displayName"
        label={t("displayName")}
        error={errors.displayName?.message}
        required
      >
        <Controller
          name="displayName"
          control={control}
          render={({ field }) => (
            <Input
              id="displayName"
              placeholder={t("displayNamePlaceholder")}
              aria-invalid={!!errors.displayName}
              {...field}
            />
          )}
        />
      </FormInputContainer>
    </div>
  );
};
