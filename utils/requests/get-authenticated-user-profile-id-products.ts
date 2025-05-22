import { cacheKeys } from "@/utils/cache-keys";
import { Profile } from "@/utils/factories/profiles-factory";

export const getAuthenticatedUserProfileIdProducts = async (
  profileId: string
): Promise<Profile[]> => {
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

    console.log("data", data);

    return data;
  } catch (error) {
    console.error("Error fetching authenticated user's profile's products:", error);
    throw new Error("Failed request for authenticated user's profile's products");
  }
};
