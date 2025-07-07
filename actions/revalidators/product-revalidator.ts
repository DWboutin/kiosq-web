import { cacheKeys } from "@/utils/cache-keys";
import { revalidatePath, revalidateTag } from "next/cache";

export const productRevalidator = ({
  productId,
  profileId,
  slugTranslations,
}: {
  productId: string;
  profileId: string;
  slugTranslations: Record<string, string>;
}) => {
  revalidateTag(cacheKeys.currentUserProductById(productId).tag);
  revalidateTag(cacheKeys.vendorProfileProducts(profileId).tag);
  revalidateTag(cacheKeys.productById(productId).tag);

  Object.entries(slugTranslations).forEach(([locale, slug]) => {
    const path = `/${locale}/vendors/${slug}`;
    revalidatePath(path);
  });
};
