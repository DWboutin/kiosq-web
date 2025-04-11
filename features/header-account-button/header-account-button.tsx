"use client";

import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { UserCircleIcon } from "@/components/ui/icons/user-circle-icon";
import { useUserStore } from "@/stores/user-store";
import { FC } from "react";

export const HeaderAccountButton: FC = () => {
  const disconnectUser = useUserStore((state) => state.disconnectUser);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-inter font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-brand-danger/20 aria-invalid:border-brand-danger hover:bg-accent hover:text-accent-foreground size-9 appearance-none select-none cursor-pointer focus:outline-none">
          <UserCircleIcon className="text-neutral-dark size-6" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            disconnectUser();
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
