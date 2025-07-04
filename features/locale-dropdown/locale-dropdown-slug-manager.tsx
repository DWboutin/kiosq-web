"use client";

import { useLocaleDropdownContext } from "@/features/locale-dropdown/locale-dropdown-provider";
import { usePathname } from "@/i18n/navigation";
import { Locales } from "@/types/app";
import { LOCALES } from "@/utils/constants";
import { useEffect, useMemo } from "react";

type LocaleDropdownSlugManagerProps = {
  currentSlug: string;
  slugTranslations: Record<Locales, string>;
};

export const LocaleDropdownSlugManager = ({
  currentSlug,
  slugTranslations,
}: LocaleDropdownSlugManagerProps) => {
  const { handleSetLocalizedPathnames } = useLocaleDropdownContext();
  const pathname = usePathname();
  const pathnames = useMemo(() => {
    return LOCALES.reduce((acc, locale) => {
      acc[locale] = pathname.replace(currentSlug, slugTranslations[locale]);
      return acc;
    }, {} as Record<Locales, string>);
  }, [currentSlug, slugTranslations, pathname]);

  useEffect(() => {
    handleSetLocalizedPathnames(pathnames);

    return () => {
      handleSetLocalizedPathnames(null);
    };
  }, [pathnames, handleSetLocalizedPathnames]);

  return null;
};
