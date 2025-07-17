import { Locales } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { LOCALES } from "@/utils/constants";
import { revalidatePath, revalidateTag } from "next/cache";

export const profileRevalidator = ({
  profileId,
  slugTranslations,
}: {
  profileId: string;
  slugTranslations: Record<Locales, string>;
}) => {
  revalidatePath("/dashboard/your-store");
  revalidateTag(cacheKeys.kiosqs.list(profileId).tag);
  LOCALES.forEach((locale) => {
    revalidateTag(cacheKeys.vendorProfileFromSlug(slugTranslations[locale], locale).tag);
  });
};
