import { cacheKeys } from "@/utils/cache-keys";
import { getVendorProfileReservationSettings } from "@/utils/requests/get-vendor-profile-reservation-settings";
import { useQuery } from "@tanstack/react-query";

export const useVendorReservationSettings = (profileId?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: cacheKeys.vendorProfileReservationSettings(profileId!).queryKey,
    queryFn: () => getVendorProfileReservationSettings(profileId!),
    enabled: !!profileId,
  });

  return {
    selectors: {
      hasReservationSettings: data,
      isLoading,
      error,
    },
    actions: {
      refetch,
    },
  };
};
