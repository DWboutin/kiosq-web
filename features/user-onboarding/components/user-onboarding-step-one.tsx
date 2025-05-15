import { FC } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { UserOnboardingValues } from "../schemas/user-onboarding-schema";

interface UserOnboardingStepOneProps {
  control: Control<UserOnboardingValues>;
  errors: FieldErrors<UserOnboardingValues>;
}

export const UserOnboardingStepOne: FC<UserOnboardingStepOneProps> = ({ control, errors }) => {
  return (
    <div className="grid w-full items-center gap-4">
      <FormInputContainer
        inputId="firstName"
        label="First Name"
        error={errors.firstName?.message}
        required
      >
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <Input
              id="firstName"
              placeholder="Enter your first name"
              aria-invalid={!!errors.firstName}
              {...field}
            />
          )}
        />
      </FormInputContainer>

      <FormInputContainer
        inputId="lastName"
        label="Last Name"
        error={errors.lastName?.message}
        required
      >
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Input
              id="lastName"
              placeholder="Enter your last name"
              aria-invalid={!!errors.lastName}
              {...field}
            />
          )}
        />
      </FormInputContainer>

      <FormInputContainer
        inputId="displayName"
        label="Display Name"
        error={errors.displayName?.message}
        required
      >
        <Controller
          name="displayName"
          control={control}
          render={({ field }) => (
            <Input
              id="displayName"
              placeholder="Enter your display name"
              aria-invalid={!!errors.displayName}
              {...field}
            />
          )}
        />
        <div className="text-sm text-muted-foreground mt-1">
          This is how your name will appear to others on the platform
        </div>
      </FormInputContainer>
    </div>
  );
};
