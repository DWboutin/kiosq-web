import { z } from "zod";
import { LOCALES, SLUG_REGEX } from "@/utils/constants";

export const createTranslationValidator = (currentLocale: string) =>
  z
    .record(z.string(), z.string().min(1, "Translation cannot be empty"))
    .optional()
    .transform((val) => val || {})
    .refine(
      (translations) =>
        Object.keys(translations).length === 0 ||
        Object.keys(translations).every(
          (key) => key !== currentLocale && LOCALES.includes(key as (typeof LOCALES)[number])
        ),
      { message: "Translation keys must be supported locales and cannot include current locale" }
    );

export const createSlugTranslationValidator = (currentLocale: string) =>
  z
    .record(
      z.string(),
      z
        .string()
        .min(1, "Translation cannot be empty")
        .regex(SLUG_REGEX, "Slug must contain only lowercase letters, numbers, and hyphens")
    )
    .optional()
    .transform((val) => val || {})
    .refine(
      (translations) =>
        Object.keys(translations).length === 0 ||
        Object.keys(translations).every(
          (key) => key !== currentLocale && LOCALES.includes(key as (typeof LOCALES)[number])
        ),
      { message: "Translation keys must be supported locales and cannot include current locale" }
    );
