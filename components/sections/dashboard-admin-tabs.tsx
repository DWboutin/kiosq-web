"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { FC } from "react";
import { useTranslations } from "next-intl";
import { DASHBOARD_ADMIN_TABS } from "@/utils/dashboard-navigation";

export const DashboardAdminTabs: FC = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const tabs = Object.values(DASHBOARD_ADMIN_TABS);

  return (
    <nav className="flex border-b border-neutral-light" aria-label="Admin navigation">
      <div className="flex space-x-2">
        {tabs.map((tab) => {
          const isActive = pathname.endsWith(tab.path);

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`px-4 py-2 font-medium text-sm inline-flex items-center transition-colors
                ${
                  isActive
                    ? "text-brand-medium border-b-2 border-brand-medium -mb-px"
                    : "text-neutral-darker hover:text-neutral-black hover:bg-neutral-lightest"
                }`}
              aria-current={isActive ? "page" : undefined}
            >
              {t(tab.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
