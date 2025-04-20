export const extractTranslations = <T>(
  source: T,
  fieldName: keyof T,
  excludeLocales: string[] = []
) => {
  if (!source || typeof source !== "object" || !(fieldName in source)) {
    return {} as Record<string, string>;
  }

  const fieldValue = source[fieldName] as unknown as Record<string, string>;
  const availableLocales = Object.keys(fieldValue || {});

  return availableLocales
    .filter((locale) => !excludeLocales.includes(locale))
    .reduce((acc, locale) => {
      const value = fieldValue?.[locale];

      if (value) {
        acc[locale] = value;
      }

      return acc;
    }, {} as Record<string, string>);
};
