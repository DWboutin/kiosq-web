import { FC } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";
import { AddTranslationField } from "@/features/add-translation-field/add-translation-field";
import { useTranslations } from "next-intl";

interface CreateProfileStepBasicInfoProps {
  control: Control<VendorProfileFormValues>;
  errors: FieldErrors<VendorProfileFormValues>;
}

export const CreateProfileStepBasicInfo: FC<CreateProfileStepBasicInfoProps> = ({
  control,
  errors,
}) => {
  const t = useTranslations("CreateProfileWizard");

  return (
    <div className="relative">
      <div className="grid w-full items-center gap-4">
        <FormInputContainer
          inputId="name"
          label={t("storeName")}
          error={errors.name?.message}
          required
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                id="name"
                placeholder={t("storeNamePlaceholder")}
                aria-invalid={!!errors.name}
                {...field}
              />
            )}
          />
        </FormInputContainer>
        <AddTranslationField name="name" control={control} errors={errors} />

        <FormInputContainer
          inputId="slug"
          label={t("storeSlug")}
          error={errors.slug?.message}
          required
        >
          <div className="flex items-center gap-2">
            <Controller
              name="slug"
              control={control}
              render={({ field }) => (
                <Input
                  id="slug"
                  placeholder={t("storeSlugPlaceholder")}
                  aria-invalid={!!errors.slug}
                  {...field}
                />
              )}
            />
          </div>
          <div className="text-sm text-muted-foreground mt-1">{t("storeSlugDescription")}</div>
        </FormInputContainer>
        <AddTranslationField name="slug" control={control} errors={errors} />
      </div>
    </div>
  );
};
