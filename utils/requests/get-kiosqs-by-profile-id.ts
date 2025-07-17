import { cacheKeys } from "@/utils/cache-keys";

export const getKiosqsByProfileId = async (profileId: string) => {
  const response = await fetch(`/api/kiosqs/${profileId}`, {
    next: {
      revalidate: 60 * 60 * 24,
      tags: [cacheKeys.kiosqs.list(profileId).tag],
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch kiosqs");
  }

  const data = await response.json();

  return data.kiosqs || [];
};
