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
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
export const HeaderAccountButton: FC = () => {
  const t = useTranslations("HeaderAccountButton");
  const disconnectUser = useUserStore((state) => state.disconnectUser);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("accountButton")}>
          <UserCircleIcon className="text-neutral-dark size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">{t("dashboard")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            disconnectUser();
          }}
        >
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
