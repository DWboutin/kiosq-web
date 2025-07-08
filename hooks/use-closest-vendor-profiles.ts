import { useLocationManagerContext } from "@/features/location-manager/location-manager-provider";
import { cacheKeys } from "@/utils/cache-keys";
import { getClosestVendorProfiles } from "@/utils/requests/get-closests-vendor-profiles";
import { useQuery } from "@tanstack/react-query";

export const useClosestVendorProfiles = () => {
  const { userLocation, isLoading: isLocationLoading } = useLocationManagerContext();
  const {
    data: vendorProfiles,
    isLoading: isProfilesLoading,
    error: profilesError,
    isFetched,
    refetch,
  } = useQuery({
    queryKey:
      userLocation?.latitude !== undefined && userLocation?.longitude !== undefined
        ? cacheKeys.closestVendorProfiles.list(userLocation.latitude, userLocation.longitude)
            .queryKey
        : [],
    queryFn: () => {
      return getClosestVendorProfiles(userLocation?.latitude, userLocation?.longitude);
    },
    enabled: (!!userLocation?.latitude && !!userLocation?.longitude) || !isLocationLoading,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  });

  return {
    selectors: {
      vendorProfiles,
      isLoading: isProfilesLoading || isLocationLoading,
      error: profilesError,
      isFetched,
    },
    actions: {
      refetch,
    },
  };
};
