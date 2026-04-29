import { cacheKeys } from "@/utils/cache-keys";
import { AuthenticatedUserReservation } from "@/utils/factories/authenticated-user-reservations-factory";

export const getAuthenticatedUserReservations = async (): Promise<
  AuthenticatedUserReservation[]
> => {
  try {
    const cacheInfo = cacheKeys.currentUserReservations.list;
    const response = await fetch(`/api/users/current/reservations`, {
      next: {
        tags: [cacheInfo.tag],
        revalidate: cacheInfo.revalidate,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user's reservations");
    }

    const data = await response.json();

    return data.reservations;
  } catch (error) {
    console.error("Error fetching authenticated user's reservations:", error);
    throw new Error("Failed request for authenticated user's reservations");
  }
};
