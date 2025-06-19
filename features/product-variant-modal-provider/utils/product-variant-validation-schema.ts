import { z } from "zod";
import { UNITS } from "@/utils/constants";

export const createProductVariantFormSchema = (t: (key: string) => string) => {
  return z.object({
    id: z.string().min(1),
    quantity: z
      .number()
      .min(0.01, t("ProductVariantForm.validationQuantityRequired"))
      .positive(t("ProductVariantForm.validationQuantityPositive")),
    unit: z
      .string()
      .min(1, t("ProductVariantForm.validationUnitRequired"))
      .refine((val) => UNITS.includes(val as (typeof UNITS)[number]), {
        message: t("ProductVariantForm.validationUnitInvalid"),
      }),
    price: z
      .number()
      .min(0.01, t("ProductVariantForm.validationPriceRequired"))
      .positive(t("ProductVariantForm.validationPricePositive")),
    imageUrl: z.string().optional().nullable(),
    isDefault: z.boolean().optional(),
  });
};

export type ProductVariantFormValues = z.infer<ProductVariantFormSchema>;
export type ProductVariantFormSchema = ReturnType<typeof createProductVariantFormSchema>;
