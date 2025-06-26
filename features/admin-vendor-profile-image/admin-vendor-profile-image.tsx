import { Button } from "@/components/ui/button";
import { PhotoIcon } from "@/components/ui/icons/photo-icon";
import { Modal } from "@/components/ui/modal";
import { AdminVendorProfileImageForm } from "@/features/admin-vendor-profile-image/admin-vendor-profile-image-form";
import { useAdminVendorProfileImage } from "@/features/admin-vendor-profile-image/hooks/use-admin-vendor-profile-image";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FC } from "react";

type AdminVendorProfileImageProps = {
  profileId: string;
  profileImageUrl: string | null;
};

export const AdminVendorProfileImage: FC<AdminVendorProfileImageProps> = ({
  profileId,
  profileImageUrl,
}) => {
  const t = useTranslations("AdminVendorProfileImage");
  const {
    selectors: { modalRef, control, errors, isSubmitting },
    actions: { handleFormSubmit, handleOpenModal },
  } = useAdminVendorProfileImage({ profileId, profileImageUrl });

  return (
    <>
      <div className="relative">
        <Image
          src={profileImageUrl || "/placeholders/182x182.jpg"}
          alt="Profile picture"
          width={182}
          height={182}
          className="rounded-full border-2 border-neutral-white mt-[-92px] ml-5"
        />
        <div className="absolute top-0 right-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenModal}
            className="rounded-full p-2"
          >
            <PhotoIcon className="w-4 h-4" />
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
        content={<AdminVendorProfileImageForm control={control} errors={errors} />}
      />
    </>
  );
};
