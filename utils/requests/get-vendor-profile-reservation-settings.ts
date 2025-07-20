import { cacheKeys } from "@/utils/cache-keys";
import { getBaseUrl } from "@/utils/get-base-url";

export const getVendorProfileReservationSettings = async (profileId: string): Promise<boolean> => {
  try {
    const cacheKey = cacheKeys.vendorProfileReservationSettings(profileId);
    const response = await fetch(`${getBaseUrl()}/api/profiles/${profileId}/reservation-settings`, {
      next: {
        revalidate: cacheKey.revalidate,
        tags: [cacheKey.tag],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch vendor profile reservation settings");
    }

    const data = await response.json();

    return data.hasReservationSettings;
  } catch (error) {
    console.error("Error fetching vendor profile reservation settings:", error);
    throw new Error("Failed request for vendor profile reservation settings");
  }
};
