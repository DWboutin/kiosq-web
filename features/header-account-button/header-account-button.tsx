"use client";

import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { UserCircleIcon } from "@/components/ui/icons/user-circle-icon";
import { useUserStore } from "@/stores/user-store";
import { FC, memo, useMemo } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { LOCALES } from "@/utils/constants";

export const HeaderAccountButton: FC = memo(() => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocales = useMemo(() => LOCALES.filter((l) => l !== locale), [locale]);
  const disconnectUser = useUserStore((state) => state.disconnectUser);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("HeaderAccountButton.accountButton")}>
          <UserCircleIcon className="text-neutral-dark size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{t("HeaderAccountButton.myAccount")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>{t("HeaderAccountButton.languages")}</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>{t(`Locales.${locale}`)}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {otherLocales.map((otherLocale) => (
                  <DropdownMenuItem key={otherLocale} asChild>
                    <Link href={pathname} locale={otherLocale}>
                      {t(`Locales.${otherLocale}`)}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">{t("HeaderAccountButton.dashboard")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            disconnectUser();
          }}
        >
          {t("HeaderAccountButton.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

HeaderAccountButton.displayName = "HeaderAccountButton";
