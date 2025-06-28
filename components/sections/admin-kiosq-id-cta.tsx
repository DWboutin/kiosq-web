"use client";

import { ClockIcon } from "@/components/ui/icons/clock-icon";
import { LocaleFullDate } from "@/components/ui/locale-date";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { KiosqFormDrawer } from "@/features/kiosq-form-drawer/kiosq-form-drawer";
import { AuthenticatedUserKiosq } from "@/utils/factories/authenticated-user-kiosqs-factory";
import { useFormatter, useTranslations } from "next-intl";
import { FC } from "react";

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
  const format = useFormatter();
  const dateTime = new Date(updatedAt);
  const formattedDate = format.dateTime(dateTime, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  return (
    <div className="w-full flex flex-col items-end gap-2">
      <div className="flex flex-row gap-2">
        <KiosqFormDrawer editMode kiosqId={kiosqId} kiosqData={kiosqData} />
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
