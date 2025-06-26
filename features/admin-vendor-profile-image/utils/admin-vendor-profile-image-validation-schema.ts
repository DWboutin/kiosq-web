import { z } from "zod";

export const createAdminVendorProfileImageFormSchema = () =>
  z.object({
    imageUrl: z.string().optional(),
  });

export type AdminVendorProfileImageFormValues = z.infer<
  ReturnType<typeof createAdminVendorProfileImageFormSchema>
>;
