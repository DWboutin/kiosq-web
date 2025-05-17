import { cacheKeys } from "@/utils/cache-keys";
import { Profile } from "@/utils/factories/profiles-factory";

export const getAuthenticatedUserProfile = async (): Promise<Profile[]> => {
  try {
    const response = await fetch(`/api/users/profiles/current`, {
      cache: "no-store",
      next: {
        tags: [cacheKeys.userProfiles.list.tag],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user's profiles");
    }

    const data = await response.json();

    return data.profiles;
  } catch (error) {
    console.error("Error fetching authenticated user's profiles:", error);
    throw new Error("Failed request for authenticated user's profiles");
  }
};
