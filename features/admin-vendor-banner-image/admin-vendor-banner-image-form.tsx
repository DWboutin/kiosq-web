import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { useTranslations } from "next-intl";
import { AdminVendorBannerImageFormValues } from "@/features/admin-vendor-banner-image/utils/admin-vendor-banner-image-validation-schema";

type AdminVendorBannerImageFormProps = {
  control: Control<AdminVendorBannerImageFormValues>;
  errors: FieldErrors<AdminVendorBannerImageFormValues>;
};

export const AdminVendorBannerImageForm = ({
  control,
  errors,
}: AdminVendorBannerImageFormProps) => {
  const t = useTranslations("AdminVendorBannerImageForm");

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
              requiredDimensions={{ width: 1200, height: 400 }}
              maxSize={10 * 1024 * 1024} // 10MB
            />
          )}
        />
        {errors.imageUrl && <p className="text-sm text-red-500">{errors.imageUrl.message}</p>}
      </div>
    </div>
  );
};
