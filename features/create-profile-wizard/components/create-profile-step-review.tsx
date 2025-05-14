import { FC } from "react";
import { VendorProfileFormValues } from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface CreateProfileStepReviewProps {
  formValues: VendorProfileFormValues;
}

export const CreateProfileStepReview: FC<CreateProfileStepReviewProps> = ({ formValues }) => {
  const t = useTranslations("CreateProfileWizard");

  return (
    <div className="relative">
      <div className="grid w-full items-center gap-6">
        <h3 className="text-lg font-medium">{t("reviewStoreDetails")}</h3>
        <p className="text-sm text-muted-foreground">{t("reviewStoreDetailsDescription")}</p>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-sm font-medium">{t("storeName")}</h4>
            <p className="text-sm">{formValues.name || "Not provided"}</p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-medium">{t("storeSlug")}</h4>
            <p className="text-sm">{formValues.slug || "Not provided"}</p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-sm font-medium">{t("storeDescription")}</h4>
            <p className="text-sm whitespace-pre-wrap">
              {formValues.description || "Not provided"}
            </p>
          </div>

          {formValues.bannerImage && (
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium">{t("bannerImage")}</h4>
              <div className="relative w-full h-32 rounded-md overflow-hidden border border-border">
                <Image
                  src={formValues.bannerImage}
                  alt="Banner preview"
                  fill
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
            {t.rich("termsOfServiceFullText", {
              termsLink: (chunks) => (
                <a href="#" className="text-primary underline">
                  {chunks}
                </a>
              ),
              agreementLink: (chunks) => (
                <a href="#" className="text-primary underline">
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
