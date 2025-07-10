import { cacheKeys } from "@/utils/cache-keys";
import { revalidateTag } from "next/cache";

export const scheduleRevalidator = ({ profileId }: { profileId: string }) => {
  revalidateTag(cacheKeys.currentUserSchedules.list(profileId).tag);
};
