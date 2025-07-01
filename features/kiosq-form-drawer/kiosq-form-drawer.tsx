"use client";

import { FC } from "react";
import { SideFormDrawer } from "@/components/ui/side-form-drawer";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { useKiosqForm } from "@/features/kiosq-form-drawer/hooks/use-kiosq-form";
import { KiosqForm } from "@/features/kiosq-form-drawer/components/kiosq-form";
import { useTranslations } from "next-intl";
import { ButtonBrand } from "@/components/ui/button-brand";
import { EditPencilIcon } from "@/components/ui/icons/edit-pencil-icon";
import { AuthenticatedUserKiosq } from "@/utils/factories/authenticated-user-kiosqs-factory";

type KiosqFormDrawerProps = {
  editMode?: boolean;
  kiosqId?: string;
  kiosqData?: AuthenticatedUserKiosq;
  profileId: string;
};

export const KiosqFormDrawer: FC<KiosqFormDrawerProps> = ({
  editMode = false,
  kiosqId,
  kiosqData,
  profileId,
}) => {
  const t = useTranslations("KiosqFormDrawer");
  const {
    selectors: { control, errors, isSubmitting, drawerRef },
    actions: { handleFormSubmit },
  } = useKiosqForm({ editMode, kiosqId, kiosqData });
  const title = editMode ? t("editTitle") : t("addTitle");
  const description = editMode ? t("editDescription") : t("addDescription");
  const buttonSubmitLabel = editMode ? t("editButton") : t("addButton");

  return (
    <SideFormDrawer
      ref={drawerRef}
      title={title}
      description={description}
      buttonSubmitLabel={buttonSubmitLabel}
      buttonCancelLabel={t("cancelButton")}
      handleSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
      autoFocus={!editMode}
      trigger={
        <ButtonBrand tabIndex={-1} asChild>
          {!editMode ? (
            <span>
              <PlusSquareIcon className="size-5" />
              {t("openingButton")}
            </span>
          ) : (
            <span>
              <EditPencilIcon className="size-5" />
              {t("editButton")}
            </span>
          )}
        </ButtonBrand>
      }
    >
      <div className="flex flex-col gap-4">
        <KiosqForm
          control={control}
          errors={errors}
          editMode={editMode}
          isDefault={kiosqData?.isDefault}
          profileId={profileId}
        />
      </div>
    </SideFormDrawer>
  );
};
