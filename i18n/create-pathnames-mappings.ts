import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";
import { LOCALES } from "@/utils/constants";

type LocalePathnames = Record<string, string>;
type PathnameMappings = Record<string, Record<string, string>>;

let pathnamesMappingsCache: PathnameMappings | null = null;

/**
 * Returns pathname mappings for all locales.
 * Implements a singleton pattern to ensure the mapping is only created once.
 */
export const createPathnamesMappings = (): PathnameMappings => {
  if (pathnamesMappingsCache) {
    return pathnamesMappingsCache;
  }

  const messagesByLocale: Record<string, LocalePathnames> = {
    en: enMessages.Pathnames as LocalePathnames,
    fr: frMessages.Pathnames as LocalePathnames,
  };

  // Use the first locale as the base for keys
  const baseLocale = LOCALES[0];
  const basePathnames = messagesByLocale[baseLocale] || {};

  pathnamesMappingsCache = Object.entries(basePathnames).reduce((acc, [key, basePath]) => {
    // Check if this key exists in all locales
    const hasAllLocales = LOCALES.every(
      (locale) => messagesByLocale[locale] && messagesByLocale[locale][key]
    );

    if (hasAllLocales) {
      // Create a mapping entry for this pathname
      const localeMapping = LOCALES.reduce((mapping, locale) => {
        mapping[locale] = messagesByLocale[locale][key];
        return mapping;
      }, {} as Record<string, string>);

      acc[basePath] = localeMapping;
    }

    return acc;
  }, {} as PathnameMappings);

  console.log({ pathnamesMappingsCache });

  return pathnamesMappingsCache;
};
