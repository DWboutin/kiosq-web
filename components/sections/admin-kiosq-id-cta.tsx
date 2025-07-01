"use client";

import { updateKiosqPublishedStatus } from "@/actions/update-kiosq-published-status";
import { ClockIcon } from "@/components/ui/icons/clock-icon";
import { LocaleFullDate } from "@/components/ui/locale-date";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { KiosqFormDrawer } from "@/features/kiosq-form-drawer/kiosq-form-drawer";
import { PublishedStatusManagement } from "@/features/published-status-management/published-status-management";
import { Locales, PublishedStatus } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { AuthenticatedUserKiosq } from "@/utils/factories/authenticated-user-kiosqs-factory";
import { useQueryClient } from "@tanstack/react-query";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { FC } from "react";
import { toast } from "sonner";

type AdminKiosqIdCtaProps = {
  kiosqId: string;
  kiosqData: AuthenticatedUserKiosq;
  createdAt: string;
  updatedAt: string;
};

export const AdminKiosqIdCta: FC<AdminKiosqIdCtaProps> = ({
  kiosqId,
  kiosqData,
  createdAt,
  updatedAt,
}) => {
  const t = useTranslations("AdminKiosqPage");
  const locale = useLocale();
  const format = useFormatter();
  const dateTime = new Date(updatedAt);
  const formattedDate = format.dateTime(dateTime, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  const queryClient = useQueryClient();

  const handleStatusChange = async (status: PublishedStatus) => {
    try {
      const success = await updateKiosqPublishedStatus(kiosqId, kiosqData.profileId, status);

      if (success) {
        queryClient.invalidateQueries({
          queryKey: cacheKeys.currentUserKiosqById(kiosqId).queryKey,
        });
        toast.success("Status updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="w-full flex flex-col items-end gap-2">
      <div className="flex flex-row gap-2">
        <PublishedStatusManagement
          status={kiosqData.status}
          entityName={kiosqData.nameTranslations[locale as Locales]}
          onStatusChange={handleStatusChange}
        />
        <KiosqFormDrawer
          editMode
          kiosqId={kiosqId}
          kiosqData={kiosqData}
          profileId={kiosqData.profileId}
        />
      </div>
      <div className="flex flex-row justify-end items-center gap-2">
        <span className="text-sm font-inter italic text-neutral-darker">
          {t("createdAt")}{" "}
          <span className="font-bold">
            <LocaleFullDate date={createdAt} />
          </span>
        </span>
        <TooltipContainer content={`${t("updatedAt")}: ${formattedDate}`}>
          <span>
            <ClockIcon className="size-4 text-neutral-darker" />
          </span>
        </TooltipContainer>
      </div>
    </div>
  );
};
