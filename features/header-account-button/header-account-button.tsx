import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { UserCircleIcon } from "@/components/ui/icons/user-circle-icon";
import { HeaderAccountSignOut } from "@/features/header-account-button/components/header-account-sign-out";
import { FC } from "react";

export const HeaderAccountButton: FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" aria-label="Sign out">
          <UserCircleIcon className="text-neutral-dark size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <HeaderAccountSignOut>
            <span>Sign out</span>
          </HeaderAccountSignOut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
