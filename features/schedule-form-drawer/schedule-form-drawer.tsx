"use client";

import { FC } from "react";
import { SideFormDrawer } from "@/components/ui/side-form-drawer";
import { useScheduleForm } from "@/features/schedule-form-drawer/hooks/use-schedule-form";
import { ScheduleForm } from "@/features/schedule-form-drawer/components/schedule-form";
import { useTranslations } from "next-intl";
import { ButtonBrand } from "@/components/ui/button-brand";
import { EditPencilIcon } from "@/components/ui/icons/edit-pencil-icon";

type ScheduleFormDrawerProps = {
  profileId: string;
};

export const ScheduleFormDrawer: FC<ScheduleFormDrawerProps> = ({ profileId }) => {
  const t = useTranslations("ScheduleFormDrawer");
  const {
    selectors: { control, errors, isSubmitting, drawerRef },
    actions: { handleFormSubmit },
  } = useScheduleForm({ profileId });

  return (
    <SideFormDrawer
      ref={drawerRef}
      title={t("editTitle")}
      description={t("editDescription")}
      buttonSubmitLabel={t("createButton")}
      buttonCancelLabel={t("cancelButton")}
      handleSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
      autoFocus={false}
      trigger={
        <ButtonBrand tabIndex={-1} asChild>
          <span>
            <EditPencilIcon className="size-5" />
            {t("createButton")}
          </span>
        </ButtonBrand>
      }
    >
      <div className="flex flex-col gap-4">
        <ScheduleForm control={control} errors={errors} />
      </div>
    </SideFormDrawer>
  );
};
