"use client";

import { FC, memo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SubMenuIcon } from "@/components/ui/icons/sub-menu-icon";
import Link from "next/link";
import { DashboardIcon } from "@/components/ui/icons/dashboard-icon";
import { StorefrontIcon } from "@/components/ui/icons/storefront-icon";
import { DiscountHandIcon } from "@/components/ui/icons/discount-hand-icon";
import { usePathname } from "next/navigation";
import { CalendarDotsIcon } from "@/components/ui/icons/calendar-dots-icon";
import { IdentificationCardIcon } from "@/components/ui/icons/identification-card-icon";
import { MapPinAreaIcon } from "@/components/ui/icons/map-pin-area-icon";
import { ShoppingBagIcon } from "@/components/ui/icons/shopping-bag-icon";
import { InvoiceIcon } from "@/components/ui/icons/invoice-icon";
import { VideoIcon } from "@/components/ui/icons/video-icon";
import { UserCircleIcon } from "@/components/ui/icons/user-circle-icon";
import { KeyholeIcon } from "@/components/ui/icons/keyhole-icon";

const DashboardMenuLink = memo(
  ({
    href,
    icon,
    children,
  }: {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={`flex items-center hover:bg-neutral-lightest rounded-md ${
          isActive ? "text-brand-medium" : "text-neutral-darker hover:text-neutral-black"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <Button variant="ghost" size="icon" tabIndex={-1}>
          {icon}
        </Button>
        <p className="font-inter text-base pl-2 group-[.is-open]:inline-block hidden">{children}</p>
      </Link>
    );
  }
);

DashboardMenuLink.displayName = "DashboardMenuLink";

export const DashboardMenu: FC = () => {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

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
    if (open) {
      setOpen(false);
    }
  }, [pathname]);

  return (
    <div
      className={`flex flex-col py-5 px-4 bg-neutral-white rounded-xl max-md:rounded-l-none group transition-all duration-200 ${
        open ? "is-open" : ""
      }`}
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
          Navigation
        </p>
      </div>
      <nav className="flex flex-col flex-1 pt-10" id="dashboard-navigation-menu" ref={navRef}>
        <ul className="flex flex-col gap-3" role="menu">
          <li role="none">
            <DashboardMenuLink href="/dashboard" icon={<DashboardIcon className="size-6" />}>
              Tableau de bord
            </DashboardMenuLink>
          </li>
          <li role="none">
            <DashboardMenuLink
              href="/dashboard/products"
              icon={<StorefrontIcon className="size-6" />}
            >
              Produits
            </DashboardMenuLink>
          </li>
          <li role="none">
            <DashboardMenuLink
              href="/dashboard/discounts"
              icon={<DiscountHandIcon className="size-6" />}
            >
              Rabais et promotions
            </DashboardMenuLink>
          </li>
          <li role="none">
            <DashboardMenuLink
              href="/dashboard/events"
              icon={<CalendarDotsIcon className="size-6" />}
            >
              Événements
            </DashboardMenuLink>
          </li>
          <li role="none">
            <DashboardMenuLink
              href="/dashboard/your-store"
              icon={<IdentificationCardIcon className="size-6" />}
            >
              Votre commerce
            </DashboardMenuLink>
          </li>
          <li role="none">
            <DashboardMenuLink
              href="/dashboard/your-kiosqs"
              icon={<MapPinAreaIcon className="size-6" />}
            >
              Vos kiosqs
            </DashboardMenuLink>
          </li>
          <li role="none">
            <DashboardMenuLink
              href="/dashboard/reservations"
              icon={<ShoppingBagIcon className="size-6" />}
            >
              Réservations
            </DashboardMenuLink>
          </li>
          <li role="none">
            <DashboardMenuLink href="/dashboard/billing" icon={<InvoiceIcon className="size-6" />}>
              Facturation
            </DashboardMenuLink>
          </li>
          <li role="none">
            <DashboardMenuLink href="/dashboard/admin" icon={<KeyholeIcon className="size-6" />}>
              Admin
            </DashboardMenuLink>
          </li>
        </ul>
      </nav>
      <div
        className="flex flex-col gap-2 pt-6 mt-6 border-t border-neutral-lightest"
        role="complementary"
        aria-label="User account actions"
      >
        <DashboardMenuLink href="/dashboard/training" icon={<VideoIcon className="size-6" />}>
          Vidéos de formation
        </DashboardMenuLink>
        <DashboardMenuLink href="/dashboard/account" icon={<UserCircleIcon className="size-6" />}>
          Votre compte
        </DashboardMenuLink>
      </div>
    </div>
  );
};
