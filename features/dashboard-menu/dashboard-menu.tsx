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

type DashboardMenuProtectedLinkProps = {
  role: UserRole;
} & DashboardMenuLinkProps;

const DashboardMenuProtectedLink: FC<DashboardMenuProtectedLinkProps> = ({
  role,
  href,
  icon,
  children,
  ariaLabel,
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const userData = useUserStore((state) => state.userData);

  if (userData?.role !== role) {
    return null;
  }

  return (
    <DashboardMenuLink
      href={href}
      icon={icon}
      ariaLabel={ariaLabel}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </DashboardMenuLink>
  );
};

type DashboardMenuLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  ariaLabel?: string;
  role?: UserRole;
};

const DashboardMenuLink = memo(
  ({ href, icon, children, ariaLabel, role }: DashboardMenuLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    if (role) {
      return (
        <DashboardMenuProtectedLink href={href} icon={icon} ariaLabel={ariaLabel} role={role}>
          {children}
        </DashboardMenuProtectedLink>
      );
    }

    return (
      <TooltipContainer content={ariaLabel}>
        <Link
          href={href}
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
    );
  }
);

DashboardMenuLink.displayName = "DashboardMenuLink";

export const DashboardMenu: FC = () => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const links = useMemo(() => {
    return Object.values(DASHBOARD_LINKS);
  }, []);
  const utilsLinks = useMemo(() => {
    return Object.values(DASHBOARD_UTILS_LINKS);
  }, []);

  const handleToggleMenu = () => {
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as Node;
      const menuContainer = navRef.current?.parentElement;

      if (menuContainer && !menuContainer.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("focusin", handleFocusOut);
    return () => {
      document.removeEventListener("focusin", handleFocusOut);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [pathname]);

  return (
    <div
      className={classNames(
        "relative z-10 flex flex-col py-5 px-4 bg-neutral-white rounded-xl max-md:rounded-l-none group",
        { "is-open shadow-lg shadow-neutral-400/20": open, "shadow-none": !open }
      )}
      role="navigation"
      aria-label="Dashboard navigation"
    >
      <div className="flex items-center pb-2.5 border-b border-neutral-lightest">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleMenu}
          aria-expanded={open}
          aria-controls="dashboard-navigation-menu"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          ref={toggleButtonRef}
        >
          <SubMenuIcon className="size-6 text-neutral-darker" open={open} />
        </Button>
        <p className="pl-2 text-neutral-darker font-inter text-base font-semibold group-[.is-open]:block hidden">
          {t("DashboardMenu.navigation")}
        </p>
      </div>
      <nav className="flex flex-col flex-1 mt-4" id="dashboard-navigation-menu" ref={navRef}>
        <ul className="flex flex-col gap-2" role="menu">
          {links.map((link) => (
            <li key={`dashboard-link-${link.labelKey}`} role="none" className="flex-1">
              <DashboardMenuLink
                key={link.path}
                href={link.path}
                icon={link.icon}
                ariaLabel={t(link.labelKey)}
                role={link.role}
              >
                {t(link.labelKey)}
              </DashboardMenuLink>
            </li>
          ))}
        </ul>
      </nav>
      <div
        className="flex flex-col gap-2 pt-4 mt-4 border-t border-neutral-lightest"
        role="complementary"
        aria-label="User account actions"
      >
        {utilsLinks.map((link) => (
          <DashboardMenuLink
            key={`dashboard-utils-${link.labelKey}`}
            href={link.path}
            icon={link.icon}
            ariaLabel={t(link.labelKey)}
            role={link.role}
          >
            {t(link.labelKey)}
          </DashboardMenuLink>
        ))}
      </div>
    </div>
  );
};
