import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisIcon } from "@/components/ui/icons/ellipsis-icon";
import { Link } from "@/i18n/navigation";
import { DashboardLink } from "@/utils/dashboard-navigation";
import { useTranslations } from "next-intl";
import { FC } from "react";

type DashboardBreadcrumbPreviousNavigationProps = {
  hiddenLinks: DashboardLink[];
};

export const DashboardBreadcrumbPreviousNavigation: FC<
  DashboardBreadcrumbPreviousNavigationProps
> = ({ hiddenLinks }) => {
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("DashboardBreadcrumb.previousNavigation")}
        >
          <EllipsisIcon className="size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t("DashboardBreadcrumb.previousNavigation")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hiddenLinks.map((link) => (
          <DropdownMenuItem key={link.pathKey} asChild>
            <Link className="flex flex-row items-center gap-2" href={t(link.pathKey)}>
              {link.icon}
              <span className="font-inter font-semibold">{t(link.labelKey)}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
