import { z } from "zod";

export const userStepOneSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  displayName: z.string().min(1, "Display name is required"),
});

export const userStepTwoSchema = z.object({
  postalCode: z.string().optional(),
  useGeolocation: z.boolean().default(false),
  searchRadius: z.number().min(1).max(100).default(10),
});

export const userStepThreeSchema = z.object({
  categories: z
    .array(z.string())
    .min(3, "Please select at least 3 categories")
    .max(3, "Please select at most 3 categories"),
});

export const userStepFourSchema = z.object({
  userType: z.enum(["User", "Vendor", "Business"]),
});

export const userOnboardingSchema = userStepOneSchema
  .and(userStepTwoSchema)
  .and(userStepThreeSchema)
  .and(userStepFourSchema);

export type UserStepOneValues = z.infer<typeof userStepOneSchema>;
export type UserStepTwoValues = z.infer<typeof userStepTwoSchema>;
export type UserStepThreeValues = z.infer<typeof userStepThreeSchema>;
export type UserStepFourValues = z.infer<typeof userStepFourSchema>;
export type UserOnboardingValues = z.infer<typeof userOnboardingSchema>;
