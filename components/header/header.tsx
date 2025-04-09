import { Button } from "@/components/ui/button";
import { UserCircleIcon } from "@/components/ui/icons/user-circle-icon";
import { KiosqLogo } from "@/components/ui/kiosq-logo/kiosq-logo";
import { LocationButton } from "@/components/ui/location-button";
import { SearchInput } from "@/components/ui/search-input";
import Link from "next/link";
import { FC, PropsWithChildren } from "react";
import React from "react";
import { cva } from "class-variance-authority";

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
      <div className="flex flex-1 items-center gap-6">
        <Link href="/" className="flex items-center gap-2 py-3">
          <KiosqLogo />
          <span className="text-xl font-lato text-brand-medium">kiosq</span>
        </Link>
        <div className="flex flex-1 items-center gap-2">
          <SearchInput />
        </div>
      </div>
      <div className="flex items-start justify-start gap-2">
        <LocationButton />
        <div className="py-2">
          <Link href="/login" className="flex items-center gap-2 group px-2 py-2">
            <UserCircleIcon className="w-6 h-6 text-neutral-darker group-hover:text-brand-medium" />
            <span className="text-base font-medium text-neutral-darker group-hover:text-brand-medium">
              Connexion
            </span>
          </Link>
        </div>
      </div>
      {children}
    </header>
  );
};
