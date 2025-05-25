"use client";

import { ButtonBrand } from "@/components/ui/button-brand";
import { ControlledSelect } from "@/components/ui/form-utils/controlled-select";
import { PublishedStatus } from "@/types/app";
import { useTranslations } from "next-intl";
import { FC } from "react";

type PublishedStatusManagementProps = {
  status: PublishedStatus;
};

export const PublishedStatusManagement: FC<PublishedStatusManagementProps> = ({ status }) => {
  const t = useTranslations("Global");

  return (
    <div className="flex flex-row items-center gap-2">
      <span>{t("status")}:</span>
      <ControlledSelect
        id="status"
        placeholder={t("status")}
        value={status}
        onChange={() => {}}
        options={[
          { label: t("draft"), value: "draft" },
          { label: t("published"), value: "published" },
          { label: t("deleted"), value: "deleted" },
        ]}
      />
    </div>
  );
};
