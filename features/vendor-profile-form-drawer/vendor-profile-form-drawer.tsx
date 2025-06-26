"use client";

import { FC } from "react";
import { SideFormDrawer } from "@/components/ui/side-form-drawer";
import { useVendorProfileForm } from "@/features/vendor-profile-form-drawer/hooks/use-vendor-profile-form";
import { VendorProfileForm } from "@/features/vendor-profile-form-drawer/components/vendor-profile-form";
import { useTranslations } from "next-intl";
import { ButtonBrand } from "@/components/ui/button-brand";
import { EditPencilIcon } from "@/components/ui/icons/edit-pencil-icon";

type VendorProfileFormDrawerProps = {
  profileId: string;
};

export const VendorProfileFormDrawer: FC<VendorProfileFormDrawerProps> = ({ profileId }) => {
  const t = useTranslations("VendorProfileFormDrawer");
  const {
    selectors: { control, errors, isSubmitting, drawerRef },
    actions: { handleFormSubmit },
  } = useVendorProfileForm({ profileId });

  return (
    <SideFormDrawer
      ref={drawerRef}
      title={t("editTitle")}
      description={t("editDescription")}
      buttonSubmitLabel={t("editButton")}
      buttonCancelLabel={t("cancelButton")}
      handleSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
      autoFocus={false}
      trigger={
        <ButtonBrand tabIndex={-1} asChild>
          <span>
            <EditPencilIcon className="size-5" />
            {t("editButton")}
          </span>
        </ButtonBrand>
      }
    >
      <div className="flex flex-col gap-4">
        <VendorProfileForm control={control} errors={errors} />
      </div>
    </SideFormDrawer>
  );
};
