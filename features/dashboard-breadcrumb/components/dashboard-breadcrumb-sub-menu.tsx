"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { DashboardLink } from "@/utils/dashboard-navigation";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { memo } from "react";

export const DashboardBreadcrumbSubMenu = memo(({ link }: { link: DashboardLink }) => {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <DropdownMenuItem asChild key={link.pathKey}>
      <Link
        href={t(link.pathKey)}
        className={classNames(
          "flex items-center gap-2 px-1.5 py-1 text-sm rounded-md hover:bg-neutral-100 w-full",
          { "text-brand-medium": pathname === t(link.pathKey) }
        )}
        aria-current={pathname === t(link.pathKey) ? "page" : undefined}
      >
        {link.icon}
        <span className="font-inter">{t(link.labelKey)}</span>
      </Link>
    </DropdownMenuItem>
  );
});

DashboardBreadcrumbSubMenu.displayName = "DashboardBreadcrumbSubMenu";
