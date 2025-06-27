import { Database } from "@/types/supabase";

type KiosqRow = Database["public"]["Tables"]["kiosqs"]["Row"];

export type AuthenticatedUserKiosq = {
  id: string;
  nameTranslations: Record<string, string>;
  descriptionTranslations: Record<string, string>;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  status: "open" | "temporary closed" | "closed";
  is_default: boolean;
  image_url: string | null;
  profile_id: string;
  created_at: string;
  updated_at: string;
};

export const createAuthenticatedUserKiosqFactory = (kiosq: KiosqRow): AuthenticatedUserKiosq => {
  return {
    id: kiosq.id,
    nameTranslations: (kiosq.name_translations as Record<string, string>) || {},
    descriptionTranslations: (kiosq.description_translations as Record<string, string>) || {},
    address: kiosq.address,
    city: kiosq.city,
    state: kiosq.state,
    country: kiosq.country,
    latitude: kiosq.latitude,
    longitude: kiosq.longitude,
    status: kiosq.status as "open" | "temporary closed" | "closed",
    is_default: kiosq.is_default,
    image_url: kiosq.image_url,
    profile_id: kiosq.profile_id,
    created_at: kiosq.created_at,
    updated_at: kiosq.updated_at,
  };
};
