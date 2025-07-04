import { Locales } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { getBaseUrl } from "@/utils/get-base-url";
import { ProfileWithKiosqs } from "@/utils/factories/profiles-with-kiosqs-factory";

export const getVendorProfileFromSlug = async (
  slug: string,
  locale: Locales
): Promise<ProfileWithKiosqs> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/profiles/vendors/${locale}/${slug}`, {
      next: {
        revalidate: cacheKeys.vendorProfileFromSlug(slug, locale).revalidate,
        tags: [cacheKeys.vendorProfileFromSlug(slug, locale).tag],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vendor profile from slug");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching product categories:", error);
    throw new Error("Failed request for product categories");
  }
};
