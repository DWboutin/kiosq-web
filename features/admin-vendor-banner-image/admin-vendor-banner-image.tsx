import { Button } from "@/components/ui/button";
import { PhotoIcon } from "@/components/ui/icons/photo-icon";
import { Modal } from "@/components/ui/modal";
import { AdminVendorBannerImageForm } from "@/features/admin-vendor-banner-image/admin-vendor-banner-image-form";
import { useAdminVendorBannerImage } from "@/features/admin-vendor-banner-image/hooks/use-admin-vendor-banner-image";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FC } from "react";

type AdminVendorBannerImageProps = {
  profileId: string;
  bannerImageUrl: string;
};

export const AdminVendorBannerImage: FC<AdminVendorBannerImageProps> = ({
  profileId,
  bannerImageUrl,
}) => {
  const t = useTranslations("AdminVendorBannerImage");
  const {
    selectors: { modalRef, control, errors, isSubmitting },
    actions: { handleFormSubmit, handleOpenModal },
  } = useAdminVendorBannerImage({ profileId, bannerImageUrl });

  return (
    <>
      <div className="relative z-0">
        <Image src={bannerImageUrl} alt="Banner" width={1200} height={400} />
        <div className="absolute top-5 right-5">
          <Button variant="outline" size="sm" onClick={handleOpenModal}>
            <PhotoIcon className="w-4 h-4" />
            <span className="text-sm">{t("editImage")}</span>
          </Button>
        </div>
      </div>
      <Modal
        ref={modalRef}
        title={t("modalTitle")}
        description={t("modalDescription")}
        confirmLabel={t("modalConfirmLabel")}
        cancelLabel={t("modalCancelLabel")}
        action={handleFormSubmit}
        isDestructive={false}
        closeAction={() => {}}
        loading={isSubmitting}
        content={<AdminVendorBannerImageForm control={control} errors={errors} />}
      />
    </>
  );
};
