import {
  RawKiosq,
  NameTranslations,
  DescriptionTranslations,
  PublishedStatus,
  StoreStatus,
  RawKiosqWithSchedule,
} from "@/types/app";
import { extractTranslations } from "@/utils/extract-translations";
import {
  AuthenticatedUserSchedule,
  authenticatedUserScheduleFactory,
} from "@/utils/factories/authenticated-user-schedules-factory";

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
  status: PublishedStatus;
  storeStatus: StoreStatus;
  scheduleId: string | null;
  schedule: AuthenticatedUserSchedule | null;
  isDefault: boolean;
  imageUrl: string | null;
  profileId: string;
  createdAt: string;
  updatedAt: string;
};

export const authenticatedUserKiosqFactory = (
  kiosq: RawKiosqWithSchedule
): AuthenticatedUserKiosq => {
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
    scheduleId: kiosq.schedule_id,
    schedule: kiosq.schedules ? authenticatedUserScheduleFactory(kiosq.schedules) : null,
    isDefault: kiosq.is_default,
    imageUrl: kiosq.image_url,
    profileId: kiosq.profile_id,
    createdAt: kiosq.created_at,
    updatedAt: kiosq.updated_at,
  };
};

export const authenticatedUserKiosqsFactory = (
  kiosqs: RawKiosqWithSchedule[]
): AuthenticatedUserKiosq[] => {
  return kiosqs.map(authenticatedUserKiosqFactory);
};

// Backward compatibility aliases
export type Kiosq = AuthenticatedUserKiosq;
