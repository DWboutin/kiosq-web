"use client";

import { CaretRightIcon } from "@/components/ui/icons/caret-right-icon";
import { DashboardIcon } from "@/components/ui/icons/dashboard-icon";
import { Link, usePathname } from "@/i18n/navigation";
import {
  DASHBOARD_ADMIN_TABS,
  DASHBOARD_LINKS,
  DASHBOARD_UTILS_LINKS,
} from "@/utils/dashboard-navigation";
import { useTranslations } from "next-intl";
import React, { FC, useMemo } from "react";

export const DashboardBreadcrumb: FC = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const paths = useMemo(() => {
    const splittedPathname = pathname.split("/");
    return splittedPathname.filter((path) => path !== "");
  }, [pathname]);
  const links = useMemo(() => {
    return paths.map(
      (path) => DASHBOARD_LINKS[path] || DASHBOARD_UTILS_LINKS[path] || DASHBOARD_ADMIN_TABS[path]
    );
  }, [paths, t]);

  return (
    <div className="flex flex-row justify-start items-start w-full gap-2 py-5 px-5">
      <div className="flex flex-row items-center gap-2">
        <span className="text-xl font-inter font-semibold text-neutral-dark">
          {t("DashboardBreadcrumb.managementSystem")}
        </span>
        <CaretRightIcon className="w-4 h-4" />
        <div className="flex flex-row items-center gap-2">
          {links.map((link, index) => (
            <React.Fragment key={link.path}>
              <Link
                className="flex flex-row items-center gap-2 hover:underline last:text-brand-medium"
                key={link.path}
                href={link.path}
                aria-current={index === links.length - 1 ? "page" : undefined}
              >
                {link.icon}
                <span className="text-xl font-inter font-semibold">{t(link.labelKey)}</span>
              </Link>
              {index < links.length - 1 && <CaretRightIcon className="w-4 h-4" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
