import { Locales } from "@/types/app";
import { AppConfig } from "@/app-config";

export const extractTranslations = <T>(
  source: T,
  fieldName: keyof T,
  excludeLocales: string[] = []
): Record<Locales, string> => {
  const validLocales = AppConfig.locales;
  const result: Record<Locales, string> = Object.fromEntries(
    validLocales.map((locale) => [locale, ""])
  ) as Record<Locales, string>;

  if (!source || typeof source !== "object" || !(fieldName in source)) {
    return result;
  }

  const value = source[fieldName];
  if (typeof value !== "object" || value === null) {
    return result;
  }

  for (const locale of validLocales) {
    if (
      !excludeLocales.includes(locale) &&
      Object.prototype.hasOwnProperty.call(value, locale) &&
      typeof (value as Record<string, unknown>)[locale] === "string"
    ) {
      result[locale] = (value as Record<string, string>)[locale] ?? "";
    }
  }

  return result;
};
