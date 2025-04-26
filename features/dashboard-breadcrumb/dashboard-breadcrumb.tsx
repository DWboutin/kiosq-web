"use client";

import { DashboardBreadcrumbMobileMenu } from "@/features/dashboard-breadcrumb/components/dashboard-breadcrumb-mobile-menu";
import { DashboardBreadcrumbPaths } from "@/features/dashboard-breadcrumb/components/dashboard-breadcrumb-paths";
import { useTranslations } from "next-intl";
import React, { FC } from "react";

export const DashboardBreadcrumb: FC = () => {
  const t = useTranslations();

  return (
    <div className="w-full py-4 px-5 max-md:px-2 max-md:py-2 overflow-hidden">
      <div className="flex flex-row justify-start items-center w-full gap-2 overflow-x-auto whitespace-nowrap pb-2 text-lg max-md:text-base [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DashboardBreadcrumbMobileMenu />
        <span className="font-inter font-semibold text-neutral-dark flex-shrink-0 max-md:hidden">
          {t("DashboardBreadcrumb.managementSystem")}
        </span>
        <DashboardBreadcrumbPaths />
      </div>
    </div>
  );
};
