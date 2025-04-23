import { z } from "zod";
import { LOCALES, SLUG_REGEX } from "@/utils/constants";

export const createTranslationValidator = (currentLocale: string, t: (key: string) => string) =>
  z
    .record(z.string(), z.string().min(1, t("AddTranslationField.validationTranslationRequired")))
    .optional()
    .transform((val) => val || {})
    .refine(
      (translations) =>
        Object.keys(translations).length === 0 ||
        Object.keys(translations).every(
          (key) => key !== currentLocale && LOCALES.includes(key as (typeof LOCALES)[number])
        ),
      { message: t("AddTranslationField.validationTranslationKeysSupportedLocales") }
    );

export const createSlugTranslationValidator = (currentLocale: string, t: (key: string) => string) =>
  z
    .record(
      z.string(),
      z
        .string()
        .min(1, t("AddTranslationField.validationSlugTranslationRequired"))
        .regex(SLUG_REGEX, t("AddTranslationField.validationSlugTranslationFormat"))
    )
    .optional()
    .transform((val) => val || {})
    .refine(
      (translations) =>
        Object.keys(translations).length === 0 ||
        Object.keys(translations).every(
          (key) => key !== currentLocale && LOCALES.includes(key as (typeof LOCALES)[number])
        ),
      { message: t("AddTranslationField.validationTranslationKeysSupportedLocales") }
    );
