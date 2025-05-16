import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { UserTypeOption } from "@/features/user-onboarding/components/user-onboarding-step-four";
import { UserOnboardingValues } from "@/features/user-onboarding/utils/create-user-onboarding-schema";
import { cn } from "@/lib/utils";
import { FC, KeyboardEvent } from "react";
import { ControllerRenderProps } from "react-hook-form";

type UserOnboardingUserButtonProps = {
  userType: UserTypeOption;
  idx: number;
  field: ControllerRenderProps<UserOnboardingValues, "userType">;
};

export const UserOnboardingUserButton: FC<UserOnboardingUserButtonProps> = ({
  userType,
  idx,
  field,
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      field.onChange(userType.value);
    }
  };

  return (
    <button
      key={userType.value}
      className="relative rounded-md overflow-hidden"
      tabIndex={0}
      aria-label={userType.label}
      aria-describedby={`userType-desc-${userType.value}`}
      autoFocus={idx === 0 && !field.value}
      onKeyDown={handleKeyDown}
      onClick={() => field.onChange(userType.value)}
    >
      <RadioGroupItem
        value={userType.value}
        id={`userType-${userType.value}`}
        className="absolute opacity-0"
        asChild
        tabIndex={-1}
      />
      <Label
        htmlFor={`userType-${userType.value}`}
        className={cn(
          "flex items-center space-x-3 rounded-md border p-4 cursor-pointer transition-colors",
          "outline-none hover:border-neutral-light",
          field.value === userType.value
            ? "border-brand-medium bg-brand-lightest/20"
            : "border-neutral-lightest hover:bg-neutral-lightest/50",
          "[&:has(input:focus-visible)]:ring-2 [&:has(input:focus-visible)]:ring-brand-medium [&:has(input:focus-visible)]:ring-offset-2"
        )}
      >
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neutral-lightest bg-white peer-checked:border-brand-medium peer-checked:text-brand-medium">
          {field.value === userType.value && (
            <div className="h-2.5 w-2.5 rounded-full bg-brand-medium" />
          )}
        </div>
        <div className="flex flex-1 cursor-pointer items-center gap-4">
          <div className="text-foreground">{userType.icon}</div>
          <div className="flex flex-col gap-1 text-left">
            <span className="font-medium">{userType.label}</span>
            <span id={`userType-desc-${userType.value}`} className="text-sm text-muted-foreground">
              {userType.description}
            </span>
          </div>
        </div>
      </Label>
    </button>
  );
};
