import { z } from "zod";
import { createTranslationValidator } from "@/features/add-translation-field/utils/add-translation-field-validation-schema";
import { UNITS } from "@/utils/constants";

export const createProductFormSchema = (locale: string, t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, t("ProductForm.validationNameRequired")),
    name_translations: createTranslationValidator(locale, t),
    description: z
      .string()
      .min(1, t("ProductForm.validationDescriptionRequired"))
      .transform((val) => val.trim())
      .refine((val) => val.split(/\s+/).length >= 5, {
        message: t("ProductForm.validationDescriptionMinWords"),
      }),
    description_translations: createTranslationValidator(locale, t),
    category: z.string().min(1, t("ProductForm.validationCategoryRequired")),
    subcategory: z.string().optional(),
    price: z
      .string()
      .min(1, t("ProductForm.validationPriceRequired"))
      .refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        },
        { message: t("ProductForm.validationPricePositive") }
      ),
    quantity: z
      .string()
      .min(1, t("ProductForm.validationQuantityRequired"))
      .refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        },
        { message: t("ProductForm.validationQuantityPositive") }
      ),
    unit: z
      .string()
      .min(1, t("ProductForm.validationUnitRequired"))
      .refine((val) => UNITS.includes(val as (typeof UNITS)[number]), {
        message: t("ProductForm.validationUnitInvalid"),
      }),
    checklist: z
      .array(
        z.object({
          value: z.string().min(1, t("ProductForm.validationChecklistItemRequired")),
          value_translations: createTranslationValidator(locale, t),
        })
      )
      .max(5, t("ProductForm.validationChecklistMaxItems"))
      .default([]),
  });
};

// Type to infer the schema type
export type ProductFormSchema = ReturnType<typeof createProductFormSchema>;
export type ProductFormValues = z.infer<ProductFormSchema>;
