import { ProductCategoryFormValues } from "@/features/product-category-form-drawer/hooks/use-product-category-form";
import { LOCALES } from "@/utils/constants";
import { useLocale } from "next-intl";
import { useCallback } from "react";
import { Control, Path, useController } from "react-hook-form";

export interface AddTranslationFieldSelectors {
  translationsField: Record<string, string>;
  remainingLocales: string[];
  hasAvailableTranslations: boolean;
}

export interface AddTranslationFieldActions {
  handleTranslationChange: (locale: string, value: string) => void;
  handleLocaleChange: (rowLocale: string, newLocale: string) => void;
  removeTranslation: (locale: string) => void;
  getRemainingLocales: (excludeLocale?: string) => string[];
}

export interface AddTranslationFieldHook {
  selectors: AddTranslationFieldSelectors;
  actions: AddTranslationFieldActions;
}

export function useAddTranslationField({
  name,
  control,
}: {
  name: string;
  control: Control<ProductCategoryFormValues>;
}): AddTranslationFieldHook {
  const currentLocale = useLocale();
  const translationsFieldName = `${name}_translations` as Path<ProductCategoryFormValues>;
  const { field } = useController({
    name: translationsFieldName,
    control,
  });

  const translationsField = (field.value as Record<string, string>) || {};

  const getRemainingLocales = useCallback(
    (excludeLocale = "") =>
      LOCALES.filter(
        (locale) =>
          locale !== currentLocale && (locale === excludeLocale || !(locale in translationsField))
      ),
    [currentLocale, translationsField]
  );

  const handleLocaleChange = (rowLocale: string, newLocale: string) => {
    if (rowLocale && rowLocale in translationsField) {
      const updatedTranslations = { ...translationsField };
      const value = updatedTranslations[rowLocale];
      delete updatedTranslations[rowLocale];

      if (!(newLocale in updatedTranslations)) {
        updatedTranslations[newLocale] = value;
      }

      field.onChange(updatedTranslations);
    } else if (!(newLocale in translationsField)) {
      field.onChange({
        ...translationsField,
        [newLocale]: "",
      });
    }
  };

  const handleTranslationChange = (locale: string, value: string) => {
    if (!locale) return;

    field.onChange({
      ...translationsField,
      [locale]: value,
    });
  };

  const removeTranslation = (locale: string) => {
    const newTranslations: Record<string, string> = {};

    Object.entries(translationsField).forEach(([key, value]) => {
      if (key !== locale) {
        newTranslations[key] = value;
      }
    });

    field.onChange(newTranslations);
  };

  const remainingLocales = getRemainingLocales();
  const hasAvailableTranslations = remainingLocales.length > 0;

  return {
    selectors: {
      translationsField,
      remainingLocales,
      hasAvailableTranslations,
    },
    actions: {
      handleTranslationChange,
      handleLocaleChange,
      removeTranslation,
      getRemainingLocales,
    },
  };
}
