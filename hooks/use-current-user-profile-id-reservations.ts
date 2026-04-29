import { cacheKeys } from "@/utils/cache-keys";
import { AuthenticatedUserReservation } from "@/utils/factories/authenticated-user-reservations-factory";
import { getAuthenticatedUserReservations } from "@/utils/requests/get-authenticated-user-profile-id-reservations";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserReservations(reservationsData: AuthenticatedUserReservation[]) {
  const {
    data: reservations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserReservations.list.queryKey,
    queryFn: () => getAuthenticatedUserReservations(),
    initialData: reservationsData,
  });

  return {
    selectors: {
      reservations,
      isLoading,
      error,
    },
    actions: {
      refetch,
    },
  };
}
