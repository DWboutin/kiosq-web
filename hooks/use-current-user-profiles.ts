import { cacheKeys } from "@/utils/cache-keys";
import { getAuthenticatedUserProfiles } from "@/utils/requests/get-authenticated-user-profiles";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserProfiles() {
  const {
    data: profiles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserProfiles.list.queryKey,
    queryFn: getAuthenticatedUserProfiles,
  });

  return {
    selectors: {
      profiles,
      isLoading,
      error,
    },
    actions: {
      refetch,
    },
  };
}
