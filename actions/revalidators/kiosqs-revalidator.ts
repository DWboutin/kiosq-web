import { cacheKeys } from "@/utils/cache-keys";
import { revalidateTag } from "next/cache";

export const kiosqsRevalidator = ({
  profileId,
  kiosqId,
  userProfileId,
}: {
  profileId: string;
  kiosqId?: string;
  userProfileId?: string;
}) => {
  revalidateTag(cacheKeys.closestVendorProfiles.all.tag);
  revalidateTag(cacheKeys.currentUserProfileIdKiosqs.list(profileId).tag);
  revalidateTag(cacheKeys.kiosqs.list(profileId).tag);

  if (kiosqId) {
    revalidateTag(cacheKeys.currentUserKiosqById(kiosqId).tag);
  }

  if (userProfileId) {
    revalidateTag(cacheKeys.currentUserProfileIdKiosqs.list(userProfileId).tag);
  }
};
