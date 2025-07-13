import { Locales, RawProfile, ProfileType } from "@/types/app";

export type AuthenticatedUserProfile = {
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
  stripeAccountId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
};

export const authenticatedUserProfileFactory = (profile: RawProfile): AuthenticatedUserProfile => {
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
    stripeAccountId: profile.stripe_account_id,
    isActive: profile.is_active ?? false,
    isDeleted: profile.is_deleted ?? false,
    isReviewed: profile.is_reviewed ?? false,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
};

export const authenticatedUserProfilesFactory = (
  profiles: RawProfile[]
): AuthenticatedUserProfile[] => {
  return profiles.map((profile) => authenticatedUserProfileFactory(profile));
};
