import { Locales } from "@/types/app";
import { RawClosestVendorProfile } from "@/utils/requests/get-closests-vendor-profiles";

export type ClosestVendorProfile = {
  profileId: string;
  profileNameTranslations: Record<Locales, string>;
  profileSlugTranslations: Record<Locales, string>;
  profileDescriptionTranslations: Record<Locales, string>;
  profileImage: string | null;
  profileBannerImage: string | null;
  kiosqId: string;
  kiosqNameTranslations: Record<Locales, string>;
  kiosqDescriptionTranslations: Record<Locales, string>;
  kiosqAddress: string | null;
  kiosqCity: string | null;
  kiosqState: string | null;
  kiosqCountry: string | null;
  kiosqLatitude: number;
  kiosqLongitude: number;
  kiosqStatus: string;
  distanceKm: number;
};

export const closestVendorProfilesFactory = (
  profiles: RawClosestVendorProfile[]
): ClosestVendorProfile[] => {
  return profiles.map((profile) => ({
    profileId: profile.profile_id,
    profileNameTranslations: profile.profile_name,
    profileSlugTranslations: profile.profile_slug,
    profileDescriptionTranslations: profile.profile_description,
    profileImage: profile.profile_image,
    profileBannerImage: profile.profile_banner_image,
    kiosqId: profile.kiosq_id,
    kiosqNameTranslations: profile.kiosq_name,
    kiosqDescriptionTranslations: profile.kiosq_description,
    kiosqAddress: profile.kiosq_address,
    kiosqCity: profile.kiosq_city,
    kiosqState: profile.kiosq_state,
    kiosqCountry: profile.kiosq_country,
    kiosqLatitude: profile.kiosq_latitude,
    kiosqLongitude: profile.kiosq_longitude,
    kiosqStatus: profile.kiosq_status,
    distanceKm: profile.distance_km,
  }));
};
