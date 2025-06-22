import { ButtonBrand } from "@/components/ui/button-brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubMenuIcon } from "@/components/ui/icons/sub-menu-icon";
import { DashboardBreadcrumbParentSubMenu } from "@/features/dashboard-breadcrumb/components/dashboard-breadcrumb-parent-sub-menu";
import { DashboardBreadcrumbSubMenu } from "@/features/dashboard-breadcrumb/components/dashboard-breadcrumb-sub-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { useUserStore } from "@/stores/user-store";
import {
  DASHBOARD_LINKS,
  DASHBOARD_UTILS_LINKS,
  DashboardLink,
} from "@/utils/dashboard-navigation";
import { filterLinksFromRole } from "@/utils/filter-links-from-role";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

const hasRequiredChildren = (
  link: DashboardLink
): link is DashboardLink & {
  children: NonNullable<DashboardLink["children"]>;
} => Boolean(link.children);

export const DashboardBreadcrumbMobileMenu = memo(() => {
  const t = useTranslations();
  const pathname = usePathname();
  const userData = useUserStore((state) => state.userData);
  const filteredDashboardLinks = useMemo(
    () => filterLinksFromRole(Object.values(DASHBOARD_LINKS), userData),
    [userData]
  );
  const filteredDashboardUtilsLinks = useMemo(
    () => filterLinksFromRole(Object.values(DASHBOARD_UTILS_LINKS), userData),
    [userData]
  );

  return (
    <div className="min-lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ButtonBrand variant="ghost" size="icon" aria-label={t("DashboardBreadcrumb.mobileMenu")}>
            <SubMenuIcon className="text-neutral-dark size-6" />
          </ButtonBrand>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[200px] p-2">
          <DropdownMenuLabel>{t("DashboardBreadcrumb.managementSystem")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filteredDashboardLinks.map((link) => {
            if (
              hasRequiredChildren(link) &&
              Object.values(link.children).some((child) => child.showInMobileMenu)
            ) {
              return <DashboardBreadcrumbParentSubMenu key={link.pathKey} link={link} />;
            }

            return <DashboardBreadcrumbSubMenu key={link.pathKey} link={link} />;
          })}
          <DropdownMenuSeparator />
          {filteredDashboardUtilsLinks.map((link) => (
            <Link
              key={link.pathKey}
              href={t(link.pathKey)}
              className={classNames(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-neutral-100 w-full",
                { "bg-neutral-100": pathname === t(link.pathKey) }
              )}
              aria-current={pathname === t(link.pathKey) ? "page" : undefined}
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
