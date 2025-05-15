import { FC, useMemo } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { UserOnboardingValues } from "../utils/create-user-onboarding-schema";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserSquare2, Building, Store } from "lucide-react";
import { useTranslations } from "next-intl";

interface UserOnboardingStepFourProps {
  control: Control<UserOnboardingValues>;
  errors: FieldErrors<UserOnboardingValues>;
}

type UserTypeOption = {
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
    []
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
            >
              {userTypes.map((type, idx) => (
                <button
                  key={type.value}
                  type="button"
                  role="radio"
                  aria-checked={field.value === type.value}
                  onClick={() => {
                    field.onChange(type.value);
                    document.getElementById(`userType-${type.value}`)?.click();
                  }}
                  autoFocus={idx === 0}
                  className={`flex items-center space-x-3 rounded-md border p-4 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-medium focus-visible:ring-offset-2 ${
                    field.value === type.value
                      ? "border-brand-medium bg-brand-lightest/20"
                      : "border-neutral-lightest hover:border-neutral-light hover:bg-neutral-lightest/50"
                  }`}
                >
                  <RadioGroupItem
                    value={type.value}
                    id={`userType-${type.value}`}
                    tabIndex={-1}
                    className="data-[state=checked]:border-brand-medium data-[state=checked]:text-brand-medium"
                  />
                  <Label
                    htmlFor={`userType-${type.value}`}
                    className="flex flex-1 cursor-pointer items-center gap-4"
                  >
                    <div className="text-foreground">{type.icon}</div>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-sm text-muted-foreground">{type.description}</span>
                    </div>
                  </Label>
                </button>
              ))}
            </RadioGroup>
          )}
        />
      </FormInputContainer>
    </div>
  );
};
