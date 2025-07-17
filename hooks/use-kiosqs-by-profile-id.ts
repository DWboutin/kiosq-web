import { cacheKeys } from "@/utils/cache-keys";
import { getKiosqsByProfileId } from "@/utils/requests/get-kiosqs-by-profile-id";
import { useQuery } from "@tanstack/react-query";

export const useKiosqsByProfileId = (profileId: string) => {
  const {
    data: kiosqs,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: cacheKeys.kiosqs.list(profileId).queryKey,
    queryFn: () => getKiosqsByProfileId(profileId),
  });

  return {
    selectors: {
      kiosqs,
      isLoading,
      isError,
      error,
    },
    actions: {
      refetch,
    },
  };
};
