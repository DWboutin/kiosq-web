import { ClosestVendorProfile } from "@/utils/factories/closests-vendor-profiles-factory";

export type RawClosestVendorProfile = {
  profile_id: string;
  profile_name: Record<string, string>;
  profile_slug: Record<string, string>;
  profile_description: Record<string, string>;
  profile_image: string | null;
  profile_banner_image: string | null;
  kiosq_id: string;
  kiosq_name: Record<string, string>;
  kiosq_description: Record<string, string>;
  kiosq_address: string | null;
  kiosq_city: string | null;
  kiosq_state: string | null;
  kiosq_country: string | null;
  kiosq_latitude: number;
  kiosq_longitude: number;
  kiosq_status: string;
  distance_km: number;
};

export const getClosestVendorProfiles = async (
  latitude: number,
  longitude: number,
  radius: number = 50,
  limit: number = 20
): Promise<ClosestVendorProfile[]> => {
  const searchParams = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
    limit: limit.toString(),
  });

  const response = await fetch(`/api/profiles/vendors?${searchParams}`);

  if (!response.ok) {
    throw new Error("Failed to fetch closest vendor profiles");
  }

  return response.json();
};
