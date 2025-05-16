import { z } from "zod";

export const createUserStepOneSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(1, t("firstNameRequired")),
    lastName: z.string().min(1, t("lastNameRequired")),
    displayName: z.string().min(1, t("displayNameRequired")),
  });

export const createUserStepTwoSchema = (t: (key: string) => string) =>
  z
    .object({
      postalCode: z
        .string()
        .optional()
        .refine(
          (val) =>
            !val ||
            /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/i.test(val) || // Canadian postal code
            /^\d{5}(-\d{4})?$/.test(val), // US zip code
          { message: t("invalidPostalCodeFormat") }
        ),
      useGeolocation: z.boolean(),
      geolocation: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
      searchRadius: z.number().min(50).max(500),
    })
    .refine(
      (data) => data.useGeolocation || (data.postalCode && data.postalCode.trim().length > 0),
      {
        message: t("postalCodeRequired"),
        path: ["postalCode"],
      }
    )
    .refine(
      (data) => !data.useGeolocation || (data.geolocation?.latitude && data.geolocation?.longitude),
      {
        message: t("geolocationRequired"),
        path: ["geolocation"],
      }
    );

export const createUserStepThreeSchema = (t: (key: string) => string) =>
  z.object({
    categories: z.array(z.string()).length(3, t("pleaseSelect3Categories")),
  });

export const createUserStepFourSchema = (t: (key: string) => string) =>
  z.object({
    userType: z.enum(["User", "Vendor", "Business"], {
      errorMap: () => ({ message: t("invalidUserType") }),
    }),
  });

export const createUserOnboardingSchema = (t: (key: string) => string) => {
  const userStepOneSchema = createUserStepOneSchema(t);
  const userStepTwoSchema = createUserStepTwoSchema(t);
  const userStepThreeSchema = createUserStepThreeSchema(t);
  const userStepFourSchema = createUserStepFourSchema(t);

  return userStepOneSchema.and(userStepTwoSchema).and(userStepThreeSchema).and(userStepFourSchema);
};

export type UserStepOneValues = z.infer<ReturnType<typeof createUserStepOneSchema>>;
export type UserStepTwoValues = z.infer<ReturnType<typeof createUserStepTwoSchema>>;
export type UserStepThreeValues = z.infer<ReturnType<typeof createUserStepThreeSchema>>;
export type UserStepFourValues = z.infer<ReturnType<typeof createUserStepFourSchema>>;
export type UserOnboardingValues = z.infer<ReturnType<typeof createUserOnboardingSchema>>;
