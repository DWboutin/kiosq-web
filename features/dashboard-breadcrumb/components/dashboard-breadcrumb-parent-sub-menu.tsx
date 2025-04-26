import {
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardBreadcrumbSubMenu } from "@/features/dashboard-breadcrumb/components/dashboard-breadcrumb-sub-menu";
import { DashboardLink } from "@/utils/dashboard-navigation";
import { memo } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import classNames from "classnames";

type DashboardLinkWithRequiredChildren = DashboardLink & {
  children: NonNullable<DashboardLink["children"]>;
};

export const DashboardBreadcrumbParentSubMenu = memo(
  ({ link }: { link: DashboardLinkWithRequiredChildren }) => {
    const t = useTranslations();
    const pathname = usePathname();

    return (
      <DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className={classNames("flex items-center gap-2 px-1.5 py-1 text-sm rounded-md w-full", {
              "text-brand-medium": pathname.includes(link.path),
            })}
          >
            {link.icon}
            <span className="font-inter">{t(link.labelKey)}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {Object.values(link.children).map((child) => (
                <DashboardBreadcrumbSubMenu key={child.path} link={child} />
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuGroup>
    );
  }
);

DashboardBreadcrumbParentSubMenu.displayName = "DashboardBreadcrumbParentSubMenu";
