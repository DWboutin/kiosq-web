"use client";

import { setVendorProfileForReview } from "@/actions/set-vendor-profile-for-review";
import { ButtonBrand } from "@/components/ui/button-brand";
import { ButtonWithConfirmationModal } from "@/features/button-with-confirmation-modal/button-with-confirmation-modal";
import { CheckCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { FC } from "react";

type SetVendorProfileForReviewButtonProps = {
  profileId: string;
  isActive: boolean;
  isReviewed: boolean;
};

export const SetVendorProfileForReviewButton: FC<SetVendorProfileForReviewButtonProps> = ({
  profileId,
  isActive,
  isReviewed,
}) => {
  const t = useTranslations("SetVendorProfileForReviewButton");
  const handleSetVendorProfileForReview = async () => {
    await setVendorProfileForReview(profileId);
  };

  if (isActive && isReviewed) {
    return (
      <div className="flex flex-row gap-2 items-center py-3">
        <CheckCircleIcon className="w-4 h-4 text-brand-medium" />
        <span className="text-sm text-brand-medium">{t("reviewed")}</span>
      </div>
    );
  }

  return (
    <ButtonWithConfirmationModal
      title={t("title")}
      description={t("description")}
      confirmLabel={t("confirmLabel")}
      cancelLabel={t("cancelLabel")}
      action={handleSetVendorProfileForReview}
    >
      <ButtonBrand variant="outline" disabled={isActive}>
        {isActive ? t("buttonWaiting") : t("button")}
      </ButtonBrand>
    </ButtonWithConfirmationModal>
  );
};
