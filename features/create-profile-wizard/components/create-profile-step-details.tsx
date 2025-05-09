import { FC } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";
import { Textarea } from "@/components/ui/textarea";
import { AddTranslationField } from "@/features/add-translation-field/add-translation-field";

interface CreateProfileStepDetailsProps {
  control: Control<VendorProfileFormValues>;
  errors: FieldErrors<VendorProfileFormValues>;
}

export const CreateProfileStepDetails: FC<CreateProfileStepDetailsProps> = ({
  control,
  errors,
}) => {
  return (
    <div className="relative">
      <div className="grid w-full items-center gap-4">
        <FormInputContainer
          inputId="description"
          label="Store Description"
          error={errors.description?.message}
          required
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                id="description"
                placeholder="Describe your store, products, and services..."
                aria-invalid={!!errors.description}
                rows={5}
                className="resize-none"
                {...field}
              />
            )}
          />
          <div className="text-sm text-muted-foreground mt-1">
            This will appear on your store page and help customers understand what you offer
          </div>
        </FormInputContainer>
        <AddTranslationField name="description" control={control} errors={errors} />
      </div>
    </div>
  );
};
