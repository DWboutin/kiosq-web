import { z } from "zod";
import {
  createSlugTranslationValidator,
  createTranslationValidator,
} from "@/features/add-translation-field/utils/add-translation-field-validation-schema";
import { SLUG_REGEX } from "@/utils/constants";

// Social media URL validation patterns
const FACEBOOK_URL_REGEX = /^https?:\/\/(www\.)?(facebook\.com|m\.facebook\.com)\/.+$/i;
const X_URL_REGEX = /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/.+$/i;
const INSTAGRAM_URL_REGEX = /^https?:\/\/(www\.)?instagram\.com\/.+$/i;
const TIKTOK_URL_REGEX = /^https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+$/i;

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
    facebook_page_url: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.trim() === "" || FACEBOOK_URL_REGEX.test(value),
        t("VendorProfileForm.validationFacebookUrlFormat")
      ),
    x_page_url: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.trim() === "" || X_URL_REGEX.test(value),
        t("VendorProfileForm.validationXUrlFormat")
      ),
    instagram_page_url: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.trim() === "" || INSTAGRAM_URL_REGEX.test(value),
        t("VendorProfileForm.validationInstagramUrlFormat")
      ),
    tiktok_page_url: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.trim() === "" || TIKTOK_URL_REGEX.test(value),
        t("VendorProfileForm.validationTiktokUrlFormat")
      ),
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
