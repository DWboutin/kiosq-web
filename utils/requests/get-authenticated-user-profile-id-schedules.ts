import { cacheKeys } from "@/utils/cache-keys";
import { RawSchedule } from "@/types/app";

export const getAuthenticatedUserProfileIdSchedules = async (
  profileId: string
): Promise<RawSchedule[]> => {
  try {
    const cacheInfo = cacheKeys.currentUserSchedules.list(profileId);
    const response = await fetch(`/api/users/current/profiles/${profileId}/schedules`, {
      next: {
        tags: [cacheInfo.tag],
        revalidate: cacheInfo.revalidate,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user's profile's schedules");
    }

    const data = await response.json();

    return data.schedules;
  } catch (error) {
    console.error("Error fetching authenticated user's profile's schedules:", error);
    throw new Error("Failed request for authenticated user's profile's schedules");
  }
};
