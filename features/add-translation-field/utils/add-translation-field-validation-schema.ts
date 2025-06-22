import { z } from "zod";
import { LOCALES, SLUG_REGEX } from "@/utils/constants";

export const createTranslationValidator = (currentLocale: string, t: (key: string) => string) =>
  z
    .record(z.string(), z.string())
    .optional()
    .transform((val) => {
      if (!val) return {};
      const filtered = Object.fromEntries(
        Object.entries(val).filter(([key]) => key !== currentLocale)
      );
      return filtered;
    })
    .refine(
      (translations) =>
        Object.keys(translations).length === 0 ||
        Object.keys(translations).every((key) => LOCALES.includes(key as (typeof LOCALES)[number])),
      { message: "Translation keys must be supported locales" }
    )
    .refine(
      (translations) =>
        Object.keys(translations).length === 0 ||
        Object.values(translations).every((value) => value.trim().length > 0),
      { message: t("AddTranslationField.validationTranslationRequired") }
    );

export const createSlugTranslationValidator = (currentLocale: string, t: (key: string) => string) =>
  z
    .record(z.string(), z.string())
    .optional()
    .transform((val) => {
      if (!val) return {};
      // Filter out currentLocale key and only keep other locales
      const filtered = Object.fromEntries(
        Object.entries(val).filter(([key]) => key !== currentLocale)
      );
      return filtered;
    })
    .refine(
      (translations) =>
        Object.keys(translations).length === 0 ||
        Object.keys(translations).every((key) => LOCALES.includes(key as (typeof LOCALES)[number])),
      { message: "Translation keys must be supported locales" }
    )
    .refine(
      (translations) =>
        Object.keys(translations).length === 0 ||
        Object.values(translations).every(
          (value) => value.trim().length > 0 && SLUG_REGEX.test(value)
        ),
      { message: t("AddTranslationField.validationSlugTranslationRequired") }
    );
