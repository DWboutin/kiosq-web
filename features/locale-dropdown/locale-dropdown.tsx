"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { FC, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { LOCALES } from "@/utils/constants";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { CaretRightIcon } from "@/components/ui/icons/caret-right-icon";
import classNames from "classnames";

type LocaleDropdownProps = {
  className?: string;
  short?: boolean;
};

export const LocaleDropdown: FC<LocaleDropdownProps> = ({ className, short = false }) => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocales = useMemo(() => LOCALES.filter((l) => l !== locale), [locale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={classNames("transition px-2 py-1 rounded flex items-center gap-1", className, {
          uppercase: short,
        })}
      >
        {short ? locale : t(`Locales.${locale}`)}
        <CaretRightIcon className="size-4 transition-transform rotate-90" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {otherLocales.map((otherLocale) => (
          <DropdownMenuItem key={otherLocale} asChild>
            <Link href={pathname} locale={otherLocale}>
              {t(`Locales.${otherLocale}`)}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
