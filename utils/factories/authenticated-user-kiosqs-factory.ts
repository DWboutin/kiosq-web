import { RawKiosq, NameTranslations, DescriptionTranslations } from "@/types/app";
import { extractTranslations } from "@/utils/extract-translations";

export type AuthenticatedUserKiosq = {
  id: string;
  nameTranslations: NameTranslations;
  descriptionTranslations: DescriptionTranslations;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "open" | "temporary closed" | "closed";
  isDefault: boolean;
  imageUrl: string | null;
  profileId: string;
  createdAt: string;
  updatedAt: string;
};

export const authenticatedUserKiosqFactory = (kiosq: RawKiosq): AuthenticatedUserKiosq => {
  const nameTranslations = extractTranslations(kiosq, "name_translations");
  const descriptionTranslations = extractTranslations(kiosq, "description_translations");

  return {
    id: kiosq.id,
    nameTranslations,
    descriptionTranslations,
    address: kiosq.address,
    city: kiosq.city,
    state: kiosq.state,
    country: kiosq.country,
    latitude: kiosq.latitude,
    longitude: kiosq.longitude,
    status: kiosq.status as "open" | "temporary closed" | "closed",
    isDefault: kiosq.is_default,
    imageUrl: kiosq.image_url,
    profileId: kiosq.profile_id,
    createdAt: kiosq.created_at,
    updatedAt: kiosq.updated_at,
  };
};

export const authenticatedUserKiosqsFactory = (kiosqs: RawKiosq[]): AuthenticatedUserKiosq[] => {
  return kiosqs.map(authenticatedUserKiosqFactory);
};

// Backward compatibility aliases
export type Kiosq = AuthenticatedUserKiosq;
