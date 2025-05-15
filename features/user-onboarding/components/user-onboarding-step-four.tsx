import { FC } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { UserOnboardingValues } from "../schemas/user-onboarding-schema";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UserSquare2, Building, Store } from "lucide-react";

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

const userTypes: UserTypeOption[] = [
  {
    value: "User",
    label: "User",
    description: "I want to discover deals and products",
    icon: <UserSquare2 className="h-5 w-5" />,
  },
  {
    value: "Vendor",
    label: "Vendor",
    description: "I want to sell my products or services",
    icon: <Store className="h-5 w-5" />,
  },
  {
    value: "Business",
    label: "Business",
    description: "I represent a company or organization",
    icon: <Building className="h-5 w-5" />,
  },
];

export const UserOnboardingStepFour: FC<UserOnboardingStepFourProps> = ({ control, errors }) => {
  return (
    <div className="grid w-full items-center gap-4">
      <FormInputContainer
        inputId="userType"
        label="User Type"
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
              {userTypes.map((type) => (
                <div
                  key={type.value}
                  className={`flex items-center space-x-3 rounded-md border p-4 ${
                    field.value === type.value
                      ? "border-brand-medium bg-brand-lightest"
                      : "border-neutral-lightest"
                  }`}
                >
                  <RadioGroupItem
                    value={type.value}
                    id={`userType-${type.value}`}
                    className="data-[state=checked]:border-brand-medium data-[state=checked]:text-brand-medium"
                  />
                  <Label
                    htmlFor={`userType-${type.value}`}
                    className="flex flex-1 cursor-pointer items-center gap-2"
                  >
                    <div className="text-foreground">{type.icon}</div>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-sm text-muted-foreground">{type.description}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        />
      </FormInputContainer>
    </div>
  );
};
