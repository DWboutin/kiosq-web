"use client";

import { FC, memo, useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { SubMenuIcon } from "@/components/ui/icons/sub-menu-icon";
import { Link, usePathname } from "@/i18n/navigation";
import { useUserStore } from "@/stores/user-store";
import { UserRole } from "@/types/app";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { DASHBOARD_LINKS, DASHBOARD_UTILS_LINKS } from "@/utils/dashboard-navigation";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { filterLinksFromRole } from "@/utils/filter-links-from-role";
import { useDashboardMenu } from "@/features/dashboard-menu/hooks/use-dashboard-meny";

type DashboardMenuLinkProps = {
  pathKey: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  ariaLabel?: string;
  role?: UserRole | UserRole[];
};

const DashboardMenuLink = memo(({ pathKey, icon, children, ariaLabel }: DashboardMenuLinkProps) => {
  const pathname = usePathname();
  const t = useTranslations();
  const path = t(pathKey);
  const isActive = pathname === path;

  return (
    <li role="none" className="flex-1">
      <TooltipContainer content={ariaLabel} disableHoverableContent>
        <Link
          href={path}
          className={`flex flex-row flex-1 items-center hover:bg-neutral-lightest rounded-md ${
            isActive ? "text-brand-medium" : "text-neutral-darker hover:text-neutral-black"
          }`}
          aria-current={isActive ? "page" : undefined}
          aria-label={ariaLabel}
        >
          <Button variant="ghost" size="icon" tabIndex={-1} asChild>
            <span className="size-6">{icon}</span>
          </Button>
          <p className="font-inter text-base pl-2 group-[.is-open]:inline-block hidden">
            {children}
          </p>
        </Link>
      </TooltipContainer>
    </li>
  );
});

DashboardMenuLink.displayName = "DashboardMenuLink";

export const DashboardMenu: FC = () => {
  const t = useTranslations();
  const {
    selectors: { isOpen, links, utilsLinks, navRef, toggleButtonRef },
    actions: { handleToggleMenu },
  } = useDashboardMenu();

  return (
    <div
      className={classNames(
        "relative z-10 flex flex-col py-5 px-4 bg-neutral-white rounded-xl max-md:rounded-l-none group",
        { "is-open shadow-lg shadow-neutral-400/20": isOpen, "shadow-none": !isOpen }
      )}
      role="navigation"
      aria-label="Dashboard navigation"
    >
      <div className="flex items-center pb-2.5 border-b border-neutral-lightest">
        <TooltipContainer content={t("DashboardMenu.navigation")} disableHoverableContent>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleMenu}
            aria-expanded={isOpen}
            aria-controls="dashboard-navigation-menu"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            ref={toggleButtonRef}
          >
            <SubMenuIcon className="size-6 text-neutral-darker" open={isOpen} />
          </Button>
        </TooltipContainer>
        <p className="pl-2 text-neutral-darker font-inter text-base font-semibold group-[.is-open]:block hidden">
          {t("DashboardMenu.navigation")}
        </p>
      </div>
      <nav className="flex flex-col flex-1 mt-4" id="dashboard-navigation-menu" ref={navRef}>
        <ul className="flex flex-col gap-2" role="menu">
          {links.map((link) => (
            <DashboardMenuLink
              key={link.pathKey}
              pathKey={link.pathKey}
              icon={link.icon}
              ariaLabel={t(link.labelKey)}
              role={link.role}
            >
              {t(link.labelKey)}
            </DashboardMenuLink>
          ))}
        </ul>
      </nav>
      <nav
        className="flex flex-col gap-2 pt-4 mt-4 border-t border-neutral-lightest"
        role="complementary"
        aria-label="User account actions"
      >
        <ul className="flex flex-col gap-2" role="menu">
          {utilsLinks.map((link) => (
            <DashboardMenuLink
              key={`dashboard-utils-${link.labelKey}`}
              pathKey={link.pathKey}
              icon={link.icon}
              ariaLabel={t(link.labelKey)}
              role={link.role}
            >
              {t(link.labelKey)}
            </DashboardMenuLink>
          ))}
        </ul>
      </nav>
    </div>
  );
};
