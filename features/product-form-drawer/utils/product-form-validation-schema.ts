import { z } from "zod";
import { createTranslationValidator } from "@/features/add-translation-field/utils/add-translation-field-validation-schema";
import { UNITS } from "@/utils/constants";

export const createProductFormSchema = (
  locale: string,
  t: (key: string) => string,
  editMode?: boolean
) => {
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
    checklist: z
      .array(
        z.object({
          value: z.string().min(1, t("ProductForm.validationChecklistItemRequired")),
          value_translations: createTranslationValidator(locale, t),
        })
      )
      .max(5, t("ProductForm.validationChecklistMaxItems"))
      .default([]),
    // Fields that are always present but have conditional validation
    price: z
      .string()
      .default("")
      .refine(
        (val) => {
          // Skip validation in edit mode
          if (editMode) return true;
          // Validate in create mode
          if (!val || val.trim() === "") return false;
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        },
        {
          message: editMode ? "" : t("ProductForm.validationPriceRequired"),
        }
      ),
    quantity: z
      .string()
      .default("")
      .refine(
        (val) => {
          // Skip validation in edit mode
          if (editMode) return true;
          // Validate in create mode
          if (!val || val.trim() === "") return false;
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        },
        {
          message: editMode ? "" : t("ProductForm.validationQuantityRequired"),
        }
      ),
    unit: z
      .string()
      .default("")
      .refine(
        (val) => {
          // Skip validation in edit mode
          if (editMode) return true;
          // Validate in create mode
          if (!val || val.trim() === "") return false;
          return UNITS.includes(val as (typeof UNITS)[number]);
        },
        {
          message: editMode ? "" : t("ProductForm.validationUnitRequired"),
        }
      ),
  });
};

export type ProductFormValues = z.infer<ProductFormSchema>;
export type ProductFormSchema = ReturnType<typeof createProductFormSchema>;
