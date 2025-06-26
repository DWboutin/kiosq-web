import { z } from "zod";

export const createAdminVendorBannerImageFormSchema = (t: (key: string) => string) => {
  return z.object({
    imageUrl: z.string().optional().nullable(),
  });
};

export type AdminVendorBannerImageFormValues = z.infer<AdminVendorBannerImageFormSchema>;
export type AdminVendorBannerImageFormSchema = ReturnType<
  typeof createAdminVendorBannerImageFormSchema
>;
