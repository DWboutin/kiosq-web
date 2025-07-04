import { useGeolocation } from "@/hooks/use-geolocation";
import { cacheKeys } from "@/utils/cache-keys";
import { getClosestVendorProfiles } from "@/utils/requests/get-closests-vendor-profiles";
import { useQuery } from "@tanstack/react-query";

export const useClosestVendorProfiles = () => {
  const {
    selectors: { coords, isLoading: isLocationLoading, error: locationError },
  } = useGeolocation();

  const {
    data: vendorProfiles,
    isLoading: isProfilesLoading,
    error: profilesError,
    isFetched,
    refetch,
  } = useQuery({
    queryKey:
      coords?.latitude !== undefined && coords?.longitude !== undefined
        ? cacheKeys.closestVendorProfiles.list(coords.latitude, coords.longitude).queryKey
        : [],
    queryFn: () => {
      if (!coords?.latitude || !coords?.longitude) {
        throw new Error("Location coordinates not available");
      }
      return getClosestVendorProfiles(coords.latitude, coords.longitude);
    },
    enabled: !!coords?.latitude && !!coords?.longitude,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
  });

  return {
    selectors: {
      vendorProfiles,
      isLoading: isProfilesLoading || isLocationLoading,
      error: profilesError || locationError,
      isFetched,
    },
    actions: {
      refetch,
    },
  };
};
