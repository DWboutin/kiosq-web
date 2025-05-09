import { FC } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import Image from "next/image";
import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";

interface CreateProfileStepBannerProps {
  control: Control<VendorProfileFormValues>;
  errors: FieldErrors<VendorProfileFormValues>;
}

export const CreateProfileStepBanner: FC<CreateProfileStepBannerProps> = ({ control, errors }) => {
  // We'll implement a simple URL-based banner upload for now
  // In a real implementation, this would use a file upload component
  return (
    <div className="relative">
      <div className="grid w-full items-center gap-4">
        <FormInputContainer
          inputId="bannerImage"
          label="Banner Image"
          error={errors.bannerImage?.message}
        >
          <Controller
            name="bannerImage"
            control={control}
            render={({ field }) => (
              <div className="space-y-4">
                <Input
                  id="bannerImage"
                  placeholder="https://example.com/your-banner-image.jpg"
                  aria-invalid={!!errors.bannerImage}
                  {...field}
                />

                {field.value && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border border-border">
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <span>Banner Preview</span>
                      </div>
                    </div>
                    <Image
                      src={field.value}
                      alt="Banner preview"
                      fill
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        // Hide the image on error
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                {!field.value && (
                  <div className="w-full h-48 rounded-md border border-dashed border-border flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-10 h-10" />
                      <span>Upload a banner image</span>
                      <span className="text-xs">Recommended size: 1200 x 400 pixels</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          />
          <div className="text-sm text-muted-foreground mt-1">
            Your banner image will appear at the top of your store page
          </div>
        </FormInputContainer>
      </div>
    </div>
  );
};
