"use client";

import { FC, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, usePathname } from "@/i18n/navigation";
import { LOCALES } from "@/utils/constants";

export const HeaderLocaleButton: FC = () => {
  const t = useTranslations("Locales");
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocales = useMemo(() => LOCALES.filter((l) => l !== locale), [locale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("localeButton")}
          className="uppercase text-neutral-darker"
        >
          {locale}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {otherLocales.map((otherLocale) => (
          <DropdownMenuItem key={otherLocale} asChild>
            <Link href={pathname} locale={otherLocale}>
              {t(otherLocale)}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
