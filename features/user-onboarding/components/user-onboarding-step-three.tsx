import { FC } from "react";
import { Control, Controller, FieldErrors, useWatch } from "react-hook-form";
import { UserOnboardingValues } from "../utils/create-user-onboarding-schema";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { CATEGORIES_ORDER } from "@/utils/constants";
import { UserOnboardingCategoryButton } from "@/features/user-onboarding/components/user-onboarding-category-button";
import { useTranslations } from "next-intl";

interface UserOnboardingStepThreeProps {
  control: Control<UserOnboardingValues>;
  errors: FieldErrors<UserOnboardingValues>;
}

export const UserOnboardingStepThree: FC<UserOnboardingStepThreeProps> = ({ control, errors }) => {
  const t = useTranslations("UserOnboarding");

  const selectedCategories = useWatch({
    control,
    name: "categories",
    defaultValue: [],
  });

  const handleCategoryClick = (category: string, onChange: (value: string[]) => void) => {
    if (selectedCategories.includes(category)) {
      onChange(selectedCategories.filter((c) => c !== category));
    } else {
      if (selectedCategories.length < 3) {
        onChange([...selectedCategories, category]);
      }
    }
  };

  // Filter out discountListing
  const filteredCategories = CATEGORIES_ORDER.filter(
    (category) => category.name !== "discountListing"
  );

  return (
    <div className="grid w-full items-center gap-2">
      <FormInputContainer
        inputId="categories"
        label={t("categoriesSelected", { count: selectedCategories.length })}
        error={errors.categories?.message}
        required
      >
        <Controller
          name="categories"
          control={control}
          render={({ field: { onChange } }) => (
            <div className="w-full">
              <div className="mb-4 text-xs text-gray-500">{t("categoriesDescription")}</div>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((category) => (
                  <UserOnboardingCategoryButton
                    key={category.name}
                    category={category}
                    selectedCategories={selectedCategories}
                    handleCategoryClick={handleCategoryClick}
                    onChange={onChange}
                  />
                ))}
              </div>
            </div>
          )}
        />
      </FormInputContainer>
    </div>
  );
};
