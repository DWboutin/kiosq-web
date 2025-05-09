import { FC } from "react";
import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";

interface CreateProfileStepReviewProps {
  formValues: VendorProfileFormValues;
}

export const CreateProfileStepReview: FC<CreateProfileStepReviewProps> = ({ formValues }) => {
  return (
    <div className="relative">
      <div className="grid w-full items-center gap-6">
        <h3 className="text-lg font-medium">Review Your Store Details</h3>
        <p className="text-sm text-muted-foreground">
          Please review your store details before creating your vendor profile
        </p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-sm font-medium">Store Name</h4>
            <p className="text-sm">{formValues.name || "Not provided"}</p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-medium">Store URL</h4>
            <p className="text-sm">{formValues.slug || "Not provided"}</p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-medium">Store Description</h4>
            <p className="text-sm whitespace-pre-wrap">
              {formValues.description || "Not provided"}
            </p>
          </div>

          {formValues.bannerImage && (
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium">Banner Image</h4>
              <div className="relative w-full h-32 rounded-md overflow-hidden border border-border">
                <img
                  src={formValues.bannerImage}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Hide the image on error
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-muted rounded-md">
          <p className="text-sm">
            By creating your vendor profile, you agree to our{" "}
            <a href="#" className="text-primary underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary underline">
              Vendor Agreement
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
