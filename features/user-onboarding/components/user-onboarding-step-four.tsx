import { FC, useMemo } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { RadioGroup } from "@/components/ui/radio-group";
import { UserSquare2, Building, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { UserOnboardingUserButton } from "@/features/user-onboarding/components/user-onboarding-user-button";
import { UserOnboardingValues } from "@/features/user-onboarding/utils/create-user-onboarding-schema";

interface UserOnboardingStepFourProps {
  control: Control<UserOnboardingValues>;
  errors: FieldErrors<UserOnboardingValues>;
}

export type UserTypeOption = {
  value: "User" | "Vendor" | "Business";
  label: string;
  description: string;
  icon: React.ReactNode;
};

export const UserOnboardingStepFour: FC<UserOnboardingStepFourProps> = ({ control, errors }) => {
  const t = useTranslations("UserOnboarding");

  const userTypes: UserTypeOption[] = useMemo(
    () => [
      {
        value: "User",
        label: t("userTypeUser"),
        description: t("userTypeUserDescription"),
        icon: <UserSquare2 className="h-5 w-5" />,
      },
      {
        value: "Vendor",
        label: t("userTypeVendor"),
        description: t("userTypeVendorDescription"),
        icon: <Store className="h-5 w-5" />,
      },
      {
        value: "Business",
        label: t("userTypeBusiness"),
        description: t("userTypeBusinessDescription"),
        icon: <Building className="h-5 w-5" />,
      },
    ],
    [t]
  );

  return (
    <div className="grid w-full items-center gap-4">
      <FormInputContainer
        inputId="userType"
        label={t("userType")}
        error={errors.userType?.message}
        required
      >
        <Controller
          name="userType"
          control={control}
          render={({ field }) => (
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col gap-3"
              aria-labelledby="userType-label"
            >
              {userTypes.map((type, idx) => (
                <UserOnboardingUserButton
                  key={type.value}
                  userType={type}
                  idx={idx}
                  field={field}
                />
              ))}
            </RadioGroup>
          )}
        />
      </FormInputContainer>
    </div>
  );
};
