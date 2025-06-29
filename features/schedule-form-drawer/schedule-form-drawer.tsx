"use client";

import { FC } from "react";
import { SideFormDrawer } from "@/components/ui/side-form-drawer";
import { useScheduleForm } from "@/features/schedule-form-drawer/hooks/use-schedule-form";
import { ScheduleForm } from "@/features/schedule-form-drawer/components/schedule-form";
import { useTranslations } from "next-intl";
import { ButtonBrand } from "@/components/ui/button-brand";
import { PlusSquareIcon } from "lucide-react";

type ScheduleFormDrawerProps = {
  profileId: string;
};

export const ScheduleFormDrawer: FC<ScheduleFormDrawerProps> = ({ profileId }) => {
  const t = useTranslations("ScheduleFormDrawer");
  const {
    selectors: { control, errors, isSubmitting, drawerRef, isEditMode },
    actions: { handleFormSubmit, handleStateChange },
  } = useScheduleForm({ profileId });

  return (
    <SideFormDrawer
      ref={drawerRef}
      title={isEditMode ? t("editTitle") : t("createTitle")}
      description={isEditMode ? t("editDescription") : t("createDescription")}
      buttonSubmitLabel={isEditMode ? t("editButton") : t("createButton")}
      buttonCancelLabel={t("cancelButton")}
      handleSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
      autoFocus={false}
      onStateChange={handleStateChange}
      trigger={
        <ButtonBrand tabIndex={-1} asChild>
          <span>
            <PlusSquareIcon className="size-5" />
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
