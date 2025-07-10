import { cacheKeys } from "@/utils/cache-keys";
import { useQueryClient } from "@tanstack/react-query";

export const useKiosqsInvalidator = () => {
  const queryClient = useQueryClient();

  const revalidate = async ({ kiosqId, profileId }: { kiosqId: string; profileId: string }) => {
    if (kiosqId) {
      await queryClient.invalidateQueries({
        queryKey: cacheKeys.currentUserKiosqById(kiosqId).queryKey,
      });
    }
    if (profileId) {
      await queryClient.invalidateQueries({
        queryKey: cacheKeys.currentUserProfileIdKiosqs.list(profileId).queryKey,
      });
    }
    await queryClient.invalidateQueries({
      queryKey: cacheKeys.closestVendorProfiles.all.queryKey,
    });
  };

  return { revalidate };
};
