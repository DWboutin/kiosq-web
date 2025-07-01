import { Locales, NameTranslations } from "@/types/app";

/**
 * Filters translations to exclude the current locale and empty values
 * @param translations - The translations object to filter
 * @param currentLocale - The current locale to exclude
 * @returns Filtered translations object
 */
export const filterTranslations = (
  translations: NameTranslations | undefined | null,
  currentLocale: Locales
): Record<string, string> => {
  if (!translations) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(translations).filter(([key, value]) => key !== currentLocale && value !== "")
  );
};
