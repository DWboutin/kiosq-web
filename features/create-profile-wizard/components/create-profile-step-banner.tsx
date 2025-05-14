import { FC } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";
import { useTranslations } from "next-intl";
import { ImageDropzone } from "@/components/ui/image-dropzone";

interface CreateProfileStepBannerProps {
  control: Control<VendorProfileFormValues>;
  errors: FieldErrors<VendorProfileFormValues>;
}

export const CreateProfileStepBanner: FC<CreateProfileStepBannerProps> = ({ control, errors }) => {
  const t = useTranslations("CreateProfileWizard");

  return (
    <div className="relative">
      <div className="grid w-full items-center gap-4">
        <FormInputContainer
          inputId="bannerImage"
          label={t("bannerImage")}
          error={errors.bannerImage?.message}
        >
          <Controller
            name="bannerImage"
            control={control}
            render={({ field: { value, onChange, onBlur } }) => (
              <ImageDropzone
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={!!errors.bannerImage}
                requiredDimensions={{ width: 1200, height: 400 }}
                maxSize={5 * 1024 * 1024} // 5MB
              />
            )}
          />
          <div className="text-sm text-muted-foreground mt-1">{t("bannerImageDescription")}</div>
        </FormInputContainer>
      </div>
    </div>
  );
};
