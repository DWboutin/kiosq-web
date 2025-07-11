import { cacheKeys } from "@/utils/cache-keys";
import { useQueryClient } from "@tanstack/react-query";

export const useSchedulesInvalidator = () => {
  const queryClient = useQueryClient();

  const invalidate = async ({ profileId }: { profileId: string }) => {
    await queryClient.invalidateQueries({
      queryKey: cacheKeys.currentUserSchedules.list(profileId).queryKey,
    });
  };

  return { invalidate };
};
