import { FC } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";
import { Textarea } from "@/components/ui/textarea";
import { AddTranslationField } from "@/features/add-translation-field/add-translation-field";
import { useTranslations } from "next-intl";

interface CreateProfileStepDetailsProps {
  control: Control<VendorProfileFormValues>;
  errors: FieldErrors<VendorProfileFormValues>;
}

export const CreateProfileStepDetails: FC<CreateProfileStepDetailsProps> = ({
  control,
  errors,
}) => {
  const t = useTranslations("CreateProfileWizard");

  return (
    <div className="relative">
      <div className="grid w-full items-center gap-4">
        <FormInputContainer
          inputId="description"
          label={t("storeDescription")}
          error={errors.description?.message}
          required
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                id="description"
                placeholder={t("storeDescriptionPlaceholder")}
                aria-invalid={!!errors.description}
                rows={5}
                className="resize-none"
                {...field}
              />
            )}
          />
          <div className="text-sm text-muted-foreground mt-1">
            {t("storeDescriptionDescription")}
          </div>
        </FormInputContainer>
        <AddTranslationField
          name="description"
          control={control}
          errors={errors}
          fieldType="textarea"
        />
      </div>
    </div>
  );
};
