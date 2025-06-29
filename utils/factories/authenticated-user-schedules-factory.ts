import { RawSchedule, NameTranslations } from "@/types/app";
import { extractTranslations } from "@/utils/extract-translations";

export type PauseTime = {
  start: string;
  end: string;
};

export type DaySchedule = {
  isOpen: boolean;
  openTime: number | null;
  closeTime: number | null;
  pauses: PauseTime[] | null;
};

export type AuthenticatedUserSchedule = {
  id: string;
  nameTranslations: NameTranslations;
  profileId: string;
  timezone: string;
  isDefault: boolean;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
};

const mapDaySchedule = (
  isOpen: boolean,
  openTime: number | null,
  closeTime: number | null,
  pauses: unknown
): DaySchedule => ({
  isOpen,
  openTime,
  closeTime,
  pauses: pauses && Array.isArray(pauses) ? (pauses as PauseTime[]) : null,
});

export const authenticatedUserScheduleFactory = (
  schedule: RawSchedule
): AuthenticatedUserSchedule => {
  const nameTranslations = extractTranslations(schedule, "name_translations");

  return {
    id: schedule.id,
    nameTranslations,
    profileId: schedule.profile_id,
    timezone: schedule.timezone,
    isDefault: schedule.is_default,
    monday: mapDaySchedule(
      schedule.monday_is_open,
      schedule.monday_open_time,
      schedule.monday_close_time,
      schedule.monday_pauses
    ),
    tuesday: mapDaySchedule(
      schedule.tuesday_is_open,
      schedule.tuesday_open_time,
      schedule.tuesday_close_time,
      schedule.tuesday_pauses
    ),
    wednesday: mapDaySchedule(
      schedule.wednesday_is_open,
      schedule.wednesday_open_time,
      schedule.wednesday_close_time,
      schedule.wednesday_pauses
    ),
    thursday: mapDaySchedule(
      schedule.thursday_is_open,
      schedule.thursday_open_time,
      schedule.thursday_close_time,
      schedule.thursday_pauses
    ),
    friday: mapDaySchedule(
      schedule.friday_is_open,
      schedule.friday_open_time,
      schedule.friday_close_time,
      schedule.friday_pauses
    ),
    saturday: mapDaySchedule(
      schedule.saturday_is_open,
      schedule.saturday_open_time,
      schedule.saturday_close_time,
      schedule.saturday_pauses
    ),
    sunday: mapDaySchedule(
      schedule.sunday_is_open,
      schedule.sunday_open_time,
      schedule.sunday_close_time,
      schedule.sunday_pauses
    ),
    createdAt: schedule.created_at,
    updatedAt: schedule.updated_at,
    updatedBy: schedule.updated_by,
  };
};

export const authenticatedUserSchedulesFactory = (
  schedules: RawSchedule[]
): AuthenticatedUserSchedule[] => {
  return schedules.map(authenticatedUserScheduleFactory);
};

// Backward compatibility alias
export type Schedule = AuthenticatedUserSchedule;
