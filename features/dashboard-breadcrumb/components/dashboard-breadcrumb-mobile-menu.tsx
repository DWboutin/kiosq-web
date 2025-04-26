import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubMenuIcon } from "@/components/ui/icons/sub-menu-icon";
import { DashboardBreadcrumbParentSubMenu } from "@/features/dashboard-breadcrumb/components/dashboard-breadcrumb-parent-sub-menu";
import { DashboardBreadcrumbSubMenu } from "@/features/dashboard-breadcrumb/components/dashboard-breadcrumb-sub-menu";
import { Link, usePathname } from "@/i18n/navigation";
import {
  DASHBOARD_LINKS,
  DASHBOARD_UTILS_LINKS,
  DashboardLink,
} from "@/utils/dashboard-navigation";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { memo } from "react";

const hasRequiredChildren = (
  link: DashboardLink
): link is DashboardLink & {
  children: NonNullable<DashboardLink["children"]>;
} => Boolean(link.children);

export const DashboardBreadcrumbMobileMenu = memo(() => {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <div className="p-1 min-lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("DashboardBreadcrumb.mobileMenu")}>
            <SubMenuIcon className="text-neutral-dark size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px] p-2">
          <DropdownMenuLabel>{t("DashboardBreadcrumb.managementSystem")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.values(DASHBOARD_LINKS).map((link) => {
            if (hasRequiredChildren(link)) {
              return <DashboardBreadcrumbParentSubMenu key={link.path} link={link} />;
            }

            return <DashboardBreadcrumbSubMenu key={link.path} link={link} />;
          })}
          <DropdownMenuSeparator />
          {Object.values(DASHBOARD_UTILS_LINKS).map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={classNames(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-neutral-100 w-full",
                { "bg-neutral-100": pathname === link.path }
              )}
              aria-current={pathname === link.path ? "page" : undefined}
            >
              {link.icon}
              <span className="font-inter">{t(link.labelKey)}</span>
            </Link>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

DashboardBreadcrumbMobileMenu.displayName = "DashboardBreadcrumbMobileMenu";
