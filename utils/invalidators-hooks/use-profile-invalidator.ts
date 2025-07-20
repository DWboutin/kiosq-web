import { cacheKeys } from "@/utils/cache-keys";
import { useQueryClient } from "@tanstack/react-query";

export const useProfileInvalidator = () => {
  const queryClient = useQueryClient();

  const invalidate = async ({ profileId }: { profileId?: string } = {}) => {
    await queryClient.invalidateQueries({
      queryKey: cacheKeys.currentUserProfiles.list.queryKey,
    });
    await queryClient.invalidateQueries({
      queryKey: cacheKeys.closestVendorProfiles.all.queryKey,
    });

    if (profileId) {
      await queryClient.invalidateQueries({
        queryKey: cacheKeys.currentUserProfileIdProducts.list(profileId).queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: cacheKeys.vendorProfileReservationSettings(profileId).queryKey,
      });
    }
  };

  return { invalidate };
};
