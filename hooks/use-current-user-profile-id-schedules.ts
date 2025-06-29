import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserProfileIdSchedules } from "@/utils/requests/get-authenticated-user-profile-id-schedules";
import { RawSchedule } from "@/types/app";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserProfileIdSchedules(schedulesData: RawSchedule[], profileId: string) {
  const {
    data: schedules = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserSchedules.list(profileId).queryKey,
    queryFn: () => getAuthenticatedUserProfileIdSchedules(profileId),
    initialData: schedulesData,
    enabled: !!profileId,
  });

  return {
    selectors: {
      schedules,
      isLoading,
      error,
    },
    actions: {
      refetch,
    },
  };
}
