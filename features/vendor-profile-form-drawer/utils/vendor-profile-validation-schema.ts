import { z } from "zod";
import {
  createSlugTranslationValidator,
  createTranslationValidator,
} from "@/features/add-translation-field/utils/add-translation-field-validation-schema";
import { SLUG_REGEX } from "@/utils/constants";

export const createVendorProfileFormSchema = (locale: string, t: (key: string) => string) => {
  return z.object({
    name: z.string().min(1, t("VendorProfileForm.validationNameRequired")),
    name_translations: createTranslationValidator(locale, t),
    description: z
      .string()
      .min(1, t("VendorProfileForm.validationDescriptionRequired"))
      .min(10, t("VendorProfileForm.validationDescriptionMinLength"))
      .max(500, t("VendorProfileForm.validationDescriptionMaxLength")),
    description_translations: createTranslationValidator(locale, t),
    slug: z
      .string()
      .min(1, t("VendorProfileForm.validationSlugRequired"))
      .regex(SLUG_REGEX, t("VendorProfileForm.validationSlugFormat")),
    slug_translations: createSlugTranslationValidator(locale, t),
  });
};

export type VendorProfileFormValues = z.infer<ReturnType<typeof createVendorProfileFormSchema>>;

// Function to check slug availability via API
export const checkSlugAvailability = async (slug: string, profileId?: string, locale?: string) => {
  try {
    const response = await fetch("/api/profiles/check-slug", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ slug, profileId, locale }),
    });

    if (!response.ok) {
      return false; // Assume unavailable on API error
    }

    const data = await response.json();
    return data.available;
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return false; // Assume unavailable on error
  }
};
