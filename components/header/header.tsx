import { Button } from "@/components/ui/button";
import { KiosqLogo } from "@/components/ui/kiosq-logo/kiosq-logo";
import { LocationButton } from "@/components/ui/location-button";
import { SearchInput } from "@/components/ui/search-input";
import Link from "next/link";
import { FC, PropsWithChildren } from "react";
import React from "react";
import { cva } from "class-variance-authority";
import { ConnectionHeaderUtils } from "@/features/connection-header-utils/connection-header-utils";
import { MobileMenuIcon } from "@/components/ui/icons/mobile-menu-icon";

const headerStyles = cva(
  "flex items-center justify-between px-5 border-b border-neutral-light gap-6",
  {
    variants: {
      hasChildren: {
        true: "",
        false: "pb-5",
      },
    },
  }
);

export const Header: FC<PropsWithChildren> = ({ children }) => {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <header className={headerStyles({ hasChildren })}>
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
        <Button variant="ghost" size="icon" aria-label="Search" className="min-md:hidden">
          <MobileMenuIcon className="text-neutral-medium size-6" />
        </Button>
      </div>
      <div className="flex items-start justify-start gap-2">
        <LocationButton />
        <div className="py-2">
          <ConnectionHeaderUtils />
        </div>
      </div>
      {children}
    </header>
  );
};
