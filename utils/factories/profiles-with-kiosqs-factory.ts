import { Locales, ProfileType, RawProfileWithKiosqs } from "@/types/app";
import { Kiosq, kiosqFactory } from "@/utils/factories/kiosqs-factory";

export type ProfileWithKiosqs = {
  id: string;
  userId: string;
  type: ProfileType | null;
  nameTranslations: Record<Locales, string>;
  descriptionTranslations: Record<Locales, string>;
  slugTranslations: Record<Locales, string>;
  bannerImage: string | null;
  profileImage: string | null;
  facebookPageUrl: string | null;
  xPageUrl: string | null;
  instagramPageUrl: string | null;
  tiktokPageUrl: string | null;
  kiosqs?: Kiosq[];
};

export const profileWithKiosqsFactory = (profile: RawProfileWithKiosqs): ProfileWithKiosqs => {
  return {
    id: profile.id,
    userId: profile.user_id,
    type: profile.type,
    nameTranslations: profile.name_translations as Record<Locales, string>,
    descriptionTranslations: profile.description_translations as Record<Locales, string>,
    slugTranslations: profile.slug_translations as Record<Locales, string>,
    bannerImage: profile.banner_image,
    profileImage: profile.profile_image,
    facebookPageUrl: profile.facebook_page_url,
    xPageUrl: profile.x_page_url,
    instagramPageUrl: profile.instagram_page_url,
    tiktokPageUrl: profile.tiktok_page_url,
    kiosqs: profile.kiosqs?.map((kiosq) => kiosqFactory(kiosq)),
  };
};

export const profilesWithKiosqsFactory = (
  profiles: RawProfileWithKiosqs[]
): ProfileWithKiosqs[] => {
  return profiles.map((profile) => profileWithKiosqsFactory(profile));
};
