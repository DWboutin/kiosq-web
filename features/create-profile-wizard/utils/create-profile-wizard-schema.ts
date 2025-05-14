import {
  createSlugTranslationValidator,
  createTranslationValidator,
} from "@/features/add-translation-field/utils/add-translation-field-validation-schema";
import { SLUG_REGEX } from "@/utils/constants";
import { z } from "zod";

export const createProfileWizardSchema = (locale: string, t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, "Name is required"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(SLUG_REGEX, "Slug must contain only lowercase letters, numbers, and hyphens"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description cannot exceed 500 characters"),
    bannerImage: z.string().optional(),
    name_translations: createTranslationValidator(locale, t),
    description_translations: createTranslationValidator(locale, t),
    slug_translations: createSlugTranslationValidator(locale, t),
  });
};

export type VendorProfileFormValues = z.infer<ReturnType<typeof createProfileWizardSchema>>;
