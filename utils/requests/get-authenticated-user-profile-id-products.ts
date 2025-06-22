import { cacheKeys } from "@/utils/cache-keys";
import { AuthenticatedUserProductWithVariantsAndPrices } from "@/utils/factories/authenticated-user-product-factory";

export const getAuthenticatedUserProfileIdProducts = async (
  profileId: string
): Promise<AuthenticatedUserProductWithVariantsAndPrices[]> => {
  try {
    const cacheInfo = cacheKeys.currentUserProfileIdProducts.list(profileId);
    const response = await fetch(`/api/users/current/profiles/${profileId}/products`, {
      next: {
        tags: [cacheInfo.tag],
        revalidate: cacheInfo.revalidate,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user's profile's products");
    }

    const data = await response.json();

    return data.products;
  } catch (error) {
    console.error("Error fetching authenticated user's profile's products:", error);
    throw new Error("Failed request for authenticated user's profile's products");
  }
};
