import { z } from "zod";
import { createTranslationValidator } from "@/features/add-translation-field/utils/add-translation-field-validation-schema";

const KIOSQ_STATUSES = ["open", "temporary closed", "closed"] as const;

export const createKiosqFormSchema = (locale: string, t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, t("KiosqForm.validationNameRequired")),
    name_translations: createTranslationValidator(locale, t),
    description: z.string().optional(),
    description_translations: createTranslationValidator(locale, t),
    address: z.string().min(1, t("KiosqForm.validationAddressRequired")),
    city: z.string().min(1, t("KiosqForm.validationCityRequired")),
    state: z.string().min(1, t("KiosqForm.validationStateRequired")),
    country: z
      .string()
      .min(1, t("KiosqForm.validationCountryRequired"))
      .length(2, t("KiosqForm.validationCountryFormat"))
      .toUpperCase(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
    status: z.enum(KIOSQ_STATUSES, {
      required_error: t("KiosqForm.validationStatusRequired"),
    }),
    is_default: z.boolean().default(false),
    image_url: z.string().optional(),
  });
};

export type KiosqFormValues = z.infer<ReturnType<typeof createKiosqFormSchema>>;
export type KiosqFormSchema = ReturnType<typeof createKiosqFormSchema>;
