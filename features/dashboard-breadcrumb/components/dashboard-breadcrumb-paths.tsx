import { CaretRightIcon } from "@/components/ui/icons/caret-right-icon";
import { Link, usePathname } from "@/i18n/navigation";
import {
  DASHBOARD_ADMIN_TABS,
  DASHBOARD_LINKS,
  DASHBOARD_UTILS_LINKS,
  DashboardLink,
} from "@/utils/dashboard-navigation";
import React from "react";
import { useTranslations } from "next-intl";
import { DashboardBreadcrumbPreviousNavigation } from "@/features/dashboard-breadcrumb/components/dashboard-breadcrumb-previous-navigation";
import { useDashboardBreadcrumbPaths } from "@/features/dashboard-breadcrumb/hooks/use-dashboard-breadcrumb-paths";
import { DashboardBreadcrumbLink } from "@/features/dashboard-breadcrumb/components/dashboard-breadcrumb-link";
import { usePathLinks } from "@/hooks/usePathsLinks";

export const DashboardBreadcrumbPaths = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const links = usePathLinks();
  const {
    selectors: { visibleLinks, hiddenLinks, shouldShowDropdown },
  } = useDashboardBreadcrumbPaths(links, containerRef as React.RefObject<HTMLDivElement>);

  return (
    <div className="flex flex-row items-center gap-2 w-full" ref={containerRef}>
      <CaretRightIcon className="w-4 h-4 flex-shrink-0 max-md:hidden" />
      <div className="flex flex-row items-center gap-2 whitespace-nowrap overflow-hidden">
        {shouldShowDropdown && <DashboardBreadcrumbPreviousNavigation hiddenLinks={hiddenLinks} />}
        {shouldShowDropdown && <CaretRightIcon className="w-4 h-4 flex-shrink-0" />}

        {visibleLinks.map((link, index) => (
          <React.Fragment key={link.path}>
            <DashboardBreadcrumbLink link={link} isLast={index === visibleLinks.length - 1} />
            {index < visibleLinks.length - 1 && (
              <CaretRightIcon className="w-4 h-4 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
