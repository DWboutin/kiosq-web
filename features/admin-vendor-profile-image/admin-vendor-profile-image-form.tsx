import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { useTranslations } from "next-intl";
import { AdminVendorProfileImageFormValues } from "@/features/admin-vendor-profile-image/utils/admin-vendor-profile-image-validation-schema";

type AdminVendorProfileImageFormProps = {
  control: Control<AdminVendorProfileImageFormValues>;
  errors: FieldErrors<AdminVendorProfileImageFormValues>;
};

export const AdminVendorProfileImageForm = ({
  control,
  errors,
}: AdminVendorProfileImageFormProps) => {
  const t = useTranslations("AdminVendorProfileImageForm");

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <Label htmlFor="imageUrl">{t("image")}</Label>
        <Controller
          name="imageUrl"
          control={control}
          render={({ field: { value, onChange, onBlur } }) => (
            <ImageDropzone
              className="h-35"
              value={value || ""}
              onChange={onChange}
              onBlur={onBlur}
              error={!!errors.imageUrl}
              requiredDimensions={{ width: 182, height: 182 }}
              maxSize={5 * 1024 * 1024} // 5MB
            />
          )}
        />
        {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
      </div>
    </div>
  );
};
