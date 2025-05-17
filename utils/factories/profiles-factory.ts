import { Locales, Profile as RawProfile, ProfileType } from "@/types/app";

export type Profile = {
  id: string;
  userId: string;
  type: ProfileType | null;
  nameTranslations: Record<Locales, string>;
  descriptionTranslations: Record<Locales, string>;
  slugTranslations: Record<Locales, string>;
  bannerImage: string | null;
  isActive: boolean;
  isDeleted: boolean;
  isReviewed: boolean;
  createdAt: string;
  updatedAt: string;
};

export const profilesFactory = (profiles: RawProfile[]): Profile[] => {
  return profiles.map((profile) => {
    return {
      id: profile.id,
      userId: profile.user_id,
      type: profile.type,
      nameTranslations: profile.name_translations as Record<Locales, string>,
      descriptionTranslations: profile.description_translations as Record<Locales, string>,
      slugTranslations: profile.slug_translations as Record<Locales, string>,
      bannerImage: profile.banner_image,
      isActive: profile.is_active ?? false,
      isDeleted: profile.is_deleted ?? false,
      isReviewed: profile.is_reviewed ?? false,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  });
};
