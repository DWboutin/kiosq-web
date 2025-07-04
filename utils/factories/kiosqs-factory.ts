import {
  RawKiosq,
  NameTranslations,
  DescriptionTranslations,
  PublishedStatus,
  StoreStatus,
} from "@/types/app";
import { extractTranslations } from "@/utils/extract-translations";

export type Kiosq = {
  id: string;
  nameTranslations: NameTranslations;
  descriptionTranslations: DescriptionTranslations;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  status: PublishedStatus;
  storeStatus: StoreStatus;
  isDefault: boolean;
  imageUrl: string | null;
};

export const kiosqFactory = (kiosq: RawKiosq): Kiosq => {
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
    status: kiosq.status as PublishedStatus,
    storeStatus: kiosq.store_status as StoreStatus,
    isDefault: kiosq.is_default,
    imageUrl: kiosq.image_url,
  };
};

export const kiosqsFactory = (kiosqs: RawKiosq[]): Kiosq[] => {
  return kiosqs.map(kiosqFactory);
};
