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

      {/* Social Media URLs Section */}
      <div className="flex flex-col gap-4 border-t pt-4 mt-4">
        <h3 className="text-lg font-medium text-gray-900">{t("socialMediaTitle")}</h3>

        <FormInputContainer
          inputId="facebook_page_url"
          label={t("facebookUrl")}
          error={errors.facebook_page_url?.message}
        >
          <Controller
            name="facebook_page_url"
            control={control}
            render={({ field }) => (
              <Input
                id="facebook_page_url"
                type="url"
                placeholder={t("facebookUrlPlaceholder")}
                aria-invalid={!!errors.facebook_page_url}
                {...field}
              />
            )}
          />
        </FormInputContainer>

        <FormInputContainer
          inputId="x_page_url"
          label={t("xUrl")}
          error={errors.x_page_url?.message}
        >
          <Controller
            name="x_page_url"
            control={control}
            render={({ field }) => (
              <Input
                id="x_page_url"
                type="url"
                placeholder={t("xUrlPlaceholder")}
                aria-invalid={!!errors.x_page_url}
                {...field}
              />
            )}
          />
        </FormInputContainer>

        <FormInputContainer
          inputId="instagram_page_url"
          label={t("instagramUrl")}
          error={errors.instagram_page_url?.message}
        >
          <Controller
            name="instagram_page_url"
            control={control}
            render={({ field }) => (
              <Input
                id="instagram_page_url"
                type="url"
                placeholder={t("instagramUrlPlaceholder")}
                aria-invalid={!!errors.instagram_page_url}
                {...field}
              />
            )}
          />
        </FormInputContainer>

        <FormInputContainer
          inputId="tiktok_page_url"
          label={t("tiktokUrl")}
          error={errors.tiktok_page_url?.message}
        >
          <Controller
            name="tiktok_page_url"
            control={control}
            render={({ field }) => (
              <Input
                id="tiktok_page_url"
                type="url"
                placeholder={t("tiktokUrlPlaceholder")}
                aria-invalid={!!errors.tiktok_page_url}
                {...field}
              />
            )}
          />
        </FormInputContainer>
      </div>
    </>
  );
};
