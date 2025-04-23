import { z } from "zod";
import {
  createTranslationValidator,
  createSlugTranslationValidator,
} from "@/features/add-translation-field/utils/add-translation-field-validation-schema";
import { SLUG_REGEX } from "@/utils/constants";

export const createProductCategorySchema = (locale: string, t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, t("ProductCategoryForm.validationNameRequired")),
    description: z
      .string()
      .min(1, t("ProductCategoryForm.validationDescriptionRequired"))
      .transform((val) => val.trim())
      .refine((val) => val.split(/\s+/).length >= 10, {
        message: t("ProductCategoryForm.validationDescriptionMinWords"),
      }),
    slug: z
      .string()
      .min(1, t("ProductCategoryForm.validationSlugRequired"))
      .regex(SLUG_REGEX, t("ProductCategoryForm.validationSlugFormat")),
    parentId: z.string(),
    orderRank: z.union([
      z.string().refine((val) => !isNaN(parseInt(val, 10)) && Number.isInteger(Number(val)), {
        message: t("ProductCategoryForm.validationOrderRankValidInteger"),
      }),
      z
        .number()
        .int()
        .transform((val) => val.toString()),
    ]),
    name_translations: createTranslationValidator(locale, t),
    description_translations: createTranslationValidator(locale, t),
    slug_translations: createSlugTranslationValidator(locale, t),
  });
};
