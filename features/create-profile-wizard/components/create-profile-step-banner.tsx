import { FC } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";
import { useTranslations } from "next-intl";
import { useDropzone } from "react-dropzone";

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
                t={t}
              />
            )}
          />
          <div className="text-sm text-muted-foreground mt-1">{t("bannerImageDescription")}</div>
        </FormInputContainer>
      </div>
    </div>
  );
};

interface ImageDropzoneProps {
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
  error: boolean;
  t: (key: string) => string;
}

const ImageDropzone: FC<ImageDropzoneProps> = ({ value, onChange, onBlur, error, t }) => {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = () => {
        onChange(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-full h-48 rounded-md overflow-hidden border border-border">
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span>{t("bannerPreview")}</span>
            </div>
          </div>
          <Image
            src={value}
            alt={t("bannerPreview")}
            fill
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              // Hide the image on error
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button
            type="button"
            className="absolute top-2 right-2 bg-background/80 p-1 rounded-full hover:bg-background"
            onClick={() => onChange("")}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`w-full h-48 rounded-md border ${
            isDragActive
              ? "border-primary border-dashed bg-primary/5"
              : "border-dashed border-border"
          } flex items-center justify-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5`}
          onBlur={onBlur}
        >
          <input {...getInputProps()} id="bannerImage" aria-invalid={error} />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="w-10 h-10" />
            <span>{isDragActive ? t("dropImageHere") : t("uploadBannerImage")}</span>
            <span className="text-xs">{t("recommendedSize")}</span>
          </div>
        </div>
      )}
    </div>
  );
};
