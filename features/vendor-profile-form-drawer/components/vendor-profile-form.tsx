import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { FieldErrors, Control } from "react-hook-form";
import { FC } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { AddTranslationField } from "@/features/add-translation-field/add-translation-field";
import { VendorProfileFormValues } from "@/features/vendor-profile-form-drawer/utils/vendor-profile-validation-schema";

type VendorProfileFormProps = {
  control: Control<VendorProfileFormValues>;
  errors: FieldErrors<VendorProfileFormValues>;
};

export const VendorProfileForm: FC<VendorProfileFormProps> = ({ control, errors }) => {
  const t = useTranslations("VendorProfileForm");

  return (
    <>
      <FormInputContainer inputId="name" label={t("name")} error={errors.name?.message} required>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              aria-invalid={!!errors.name}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField name="name" control={control} errors={errors} />

      <FormInputContainer
        inputId="description"
        label={t("description")}
        error={errors.description?.message}
        required
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              id="description"
              placeholder={t("descriptionPlaceholder")}
              aria-invalid={!!errors.description}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField
        name="description"
        control={control}
        errors={errors}
        fieldType="textarea"
      />

      <FormInputContainer inputId="slug" label={t("slug")} error={errors.slug?.message} required>
        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <Input
              id="slug"
              placeholder={t("slugPlaceholder")}
              aria-invalid={!!errors.slug}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField name="slug" control={control} errors={errors} />
    </>
  );
};
