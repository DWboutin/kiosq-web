import { z } from "zod";

export const createLocationManagerFormSchema = (t: (key: string) => string) => {
  return z.object({
    streetAddress: z.string().min(1, t("LocationManager.validationStreetAddressRequired")),
    city: z.string().min(1, t("LocationManager.validationCityRequired")),
    postalCode: z.string().min(1, t("LocationManager.validationPostalCodeRequired")),
    state: z.string().min(1, t("LocationManager.validationStateRequired")),
    country: z
      .string()
      .min(2, t("LocationManager.validationCountryRequired"))
      .max(2, t("LocationManager.validationCountryInvalid")),
    radiusKm: z
      .number()
      .min(50, t("LocationManager.validationRadiusMin"))
      .max(300, t("LocationManager.validationRadiusMax")),
  });
};

export type LocationManagerFormValues = z.infer<LocationManagerFormSchema>;
export type LocationManagerFormSchema = ReturnType<typeof createLocationManagerFormSchema>;
