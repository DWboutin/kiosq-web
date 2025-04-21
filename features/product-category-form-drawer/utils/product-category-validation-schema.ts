import { z } from "zod";
import {
  createTranslationValidator,
  createSlugTranslationValidator,
} from "@/features/add-translation-field/utils/add-translation-field-validation-schema";
import { SLUG_REGEX } from "@/utils/constants";

export const createProductCategorySchema = (locale: string) => {
  return z.object({
    name: z.string().min(1, "Name is required"),
    description: z
      .string()
      .min(1, "Description is required")
      .transform((val) => val.trim())
      .refine((val) => val.split(/\s+/).length >= 10, {
        message: "Description must contain at least 10 words",
      }),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(SLUG_REGEX, "Slug must contain only lowercase letters, numbers, and hyphens"),
    parentId: z.string(),
    orderRank: z
      .union([
        z.string().transform((val) => {
          const parsed = parseInt(val, 10);
          return isNaN(parsed) ? 0 : parsed;
        }),
        z.number(),
      ])
      .pipe(z.number().int()),
    name_translations: createTranslationValidator(locale),
    description_translations: createTranslationValidator(locale),
    slug_translations: createSlugTranslationValidator(locale),
  });
};
