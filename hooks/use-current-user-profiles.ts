import { cacheKeys } from "@/utils/cache-keys";
import { AuthenticatedUserProfile } from "@/utils/factories/authenticated-user-profiles-factory";
import { getAuthenticatedUserProfiles } from "@/utils/requests/get-authenticated-user-profiles";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserProfiles({
  profilesData,
}: {
  profilesData?: AuthenticatedUserProfile[];
} = {}) {
  const {
    data: profiles = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.currentUserProfiles.list.queryKey,
    queryFn: getAuthenticatedUserProfiles,
    initialData: profilesData,
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
