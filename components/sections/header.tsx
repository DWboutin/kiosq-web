import { Button } from "@/components/ui/button";
import { KiosqLogo } from "@/components/ui/kiosq-logo/kiosq-logo";
import { LocationButton } from "@/components/ui/location-button";
import { SearchInput } from "@/components/ui/search-input";
import { Link } from "@/i18n/navigation";
import { FC, PropsWithChildren } from "react";
import React from "react";
import { cva } from "class-variance-authority";
import { ConnectionHeaderUtils } from "@/features/connection-header-utils/connection-header-utils";
import { MobileMenuIcon } from "@/components/ui/icons/mobile-menu-icon";
import { getTranslations } from "next-intl/server";

const headerStyles = cva(
  "flex flex-col items-center justify-between border-b border-neutral-light",
  {
    variants: {
      hasChildren: {
        true: "",
        false: "pb-5",
      },
    },
  }
);

export const Header: FC<PropsWithChildren> = async ({ children }) => {
  const hasChildren = React.Children.count(children) > 0;
  const t = await getTranslations("Header");

  return (
    <header className={headerStyles({ hasChildren })}>
      <div className="flex flex-row items-center justify-between w-full gap-6  px-5">
        <div className="flex flex-1 items-center min-md:gap-6 max-md:flex-row-reverse">
          <Link
            href="/"
            className="flex items-center gap-2 py-3 max-md:flex-1 max-md:justify-center max-md:pl-14"
          >
            <KiosqLogo />
            <span className="text-xl font-lato text-brand-medium">kiosq</span>
          </Link>
          <div className="flex min-md:flex-1 items-center gap-2">
            <SearchInput />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("mobileMenuButtonAriaLabel")}
            className="min-md:hidden"
          >
            <MobileMenuIcon className="text-neutral-dark size-6" />
          </Button>
        </div>
        <div className="flex items-start justify-start gap-2">
          <LocationButton />
          <div className="py-2">
            <ConnectionHeaderUtils />
          </div>
        </div>
      </div>
      {children}
    </header>
  );
};
