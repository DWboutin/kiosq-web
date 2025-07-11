import { Locales } from "@/types/app";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  createScheduleFormSchema,
  ScheduleFormValues,
  PauseItem,
} from "@/features/schedule-form-drawer/utils/schedule-form-validation-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSchedule } from "@/actions/create-schedule";
import { updateSchedule } from "@/actions/update-schedule";
import { cacheKeys } from "@/utils/cache-keys";
import { useScheduleDrawerContext } from "@/features/schedule-drawer-provider/schedule-drawer-provider";
import { useEffect, useMemo } from "react";
import { useWatch } from "react-hook-form";
import {
  AuthenticatedUserSchedule,
  PauseTime,
} from "@/utils/factories/authenticated-user-schedules-factory";
import { DAYS_OF_WEEK } from "@/utils/constants";
import { filterTranslations } from "@/utils/filter-translations";
import { useSchedulesInvalidator } from "@/utils/invalidators-hooks/use-schedules-invalidator";

type UseScheduleFormProps = {
  profileId: string;
};

// Time management helper functions
const timeToHours = (time: number): number => Math.floor(time / 100);
const timeToMinutes = (time: number): number => time % 100;
const hoursMinutesToTime = (hours: number, minutes: number): number => hours * 100 + minutes;

// Helper function to convert time string to minutes for comparison
const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper function to format time from hours and minutes
const formatTime = (hours: string, minutes: string) => {
  return `${hours}:${minutes}`;
};

const convertTimeToString = (time: string | null | undefined): string => {
  if (!time || typeof time !== "string" || !/^[0-2][0-9]:[0-5][0-9]$/.test(time)) {
    return "09:00"; // Default fallback
  }
  return time;
};

const convertPauseTimes = (pauses: PauseTime[] | null | undefined): PauseItem[] => {
  if (!pauses) return [];

  return pauses.map((pause) => ({
    start: convertTimeToString(pause.start),
    end: convertTimeToString(pause.end),
  }));
};

const fillScheduleDefaultValues = ({
  scheduleValues,
  locale,
}: {
  scheduleValues: AuthenticatedUserSchedule | null;
  locale: Locales;
}): ScheduleFormValues => {
  const filteredNameTranslations = filterTranslations(scheduleValues?.nameTranslations, locale);

  const defaultValues = {
    name: scheduleValues?.nameTranslations[locale] || "",
    name_translations: filteredNameTranslations,
    is_default: scheduleValues?.isDefault ?? false,
    timezone: scheduleValues?.timezone || "America/Toronto",
    monday_is_open: scheduleValues?.monday.isOpen ?? true,
    monday_open_time: scheduleValues?.monday.openTime || 900, // 9:00 AM
    monday_close_time: scheduleValues?.monday.closeTime || 1700, // 5:00 PM
    monday_pauses: convertPauseTimes(scheduleValues?.monday.pauses),
    tuesday_is_open: scheduleValues?.tuesday.isOpen ?? true,
    tuesday_open_time: scheduleValues?.tuesday.openTime || 900, // 9:00 AM
    tuesday_close_time: scheduleValues?.tuesday.closeTime || 1700, // 5:00 PM
    tuesday_pauses: convertPauseTimes(scheduleValues?.tuesday.pauses),
    wednesday_is_open: scheduleValues?.wednesday.isOpen ?? true,
    wednesday_open_time: scheduleValues?.wednesday.openTime || 900, // 9:00 AM
    wednesday_close_time: scheduleValues?.wednesday.closeTime || 1700, // 5:00 PM
    wednesday_pauses: convertPauseTimes(scheduleValues?.wednesday.pauses),
    thursday_is_open: scheduleValues?.thursday.isOpen ?? true,
    thursday_open_time: scheduleValues?.thursday.openTime || 900, // 9:00 AM
    thursday_close_time: scheduleValues?.thursday.closeTime || 2100, // 9:00 PM
    thursday_pauses: convertPauseTimes(scheduleValues?.thursday.pauses),
    friday_is_open: scheduleValues?.friday.isOpen ?? true,
    friday_open_time: scheduleValues?.friday.openTime || 900, // 9:00 AM
    friday_close_time: scheduleValues?.friday.closeTime || 2100, // 9:00 PM
    friday_pauses: convertPauseTimes(scheduleValues?.friday.pauses),
    saturday_is_open: scheduleValues?.saturday.isOpen ?? true,
    saturday_open_time: scheduleValues?.saturday.openTime || 900, // 9:00 AM
    saturday_close_time: scheduleValues?.saturday.closeTime || 1700, // 5:00 PM
    saturday_pauses: convertPauseTimes(scheduleValues?.saturday.pauses),
    sunday_is_open: scheduleValues?.sunday.isOpen ?? true,
    sunday_open_time: scheduleValues?.sunday.openTime || 900, // 9:00 AM
    sunday_close_time: scheduleValues?.sunday.closeTime || 1700, // 5:00 PM
    sunday_pauses: convertPauseTimes(scheduleValues?.sunday.pauses),
  };

  return defaultValues;
};

export const useScheduleForm = ({ profileId }: UseScheduleFormProps) => {
  const t = useTranslations();
  const { drawerRef, scheduleValues, handleSetScheduleValues } = useScheduleDrawerContext();
  const locale = useLocale() as Locales;
  const queryClient = useQueryClient();
  const validationSchema = createScheduleFormSchema(locale, t);
  const isEditMode = !!scheduleValues;
  const { invalidate: invalidateSchedules } = useSchedulesInvalidator();

  const defaultValues = fillScheduleDefaultValues({ scheduleValues, locale });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema) as Resolver<ScheduleFormValues>,
  });

  // Watch all form values for auto-adjustment logic
  const watchedValues = useWatch({ control });
  const openTimes = useMemo(
    () => DAYS_OF_WEEK.map((day) => watchedValues[`${day}_open_time` as keyof ScheduleFormValues]),
    [watchedValues]
  );
  const pauseStartTimes = useMemo(
    () =>
      DAYS_OF_WEEK.flatMap((day) => {
        const pauses = watchedValues[`${day}_pauses` as keyof ScheduleFormValues] as PauseItem[];
        return pauses ? pauses.map((pause) => pause.start) : [];
      }),
    [watchedValues]
  );

  useEffect(() => {
    if (scheduleValues) {
      reset(defaultValues);
    }
  }, [scheduleValues]);

  const { mutate: submitSchedule, isPending } = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      if (isEditMode) {
        return await updateSchedule({
          profileId,
          scheduleId: scheduleValues.id,
          scheduleData: { ...data, locale },
        });
      }

      return await createSchedule({
        profileId,
        scheduleData: { ...data, locale },
      });
    },
    onSuccess: async () => {
      const message = isEditMode ? t("ScheduleForm.updated") : t("ScheduleForm.created");
      await invalidateSchedules({ profileId });
      toast.success(message);

      drawerRef.current?.close();
    },
    onError: (error: Error) => {
      const message = isEditMode ? t("ScheduleForm.updateError") : t("ScheduleForm.createError");
      toast.error(message);
      console.error("Schedule form error:", error);
    },
  });

  const onSubmit = handleSubmit((data) => {
    submitSchedule(data);
  });

  const handleStateChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleSetScheduleValues(null);
      reset(defaultValues);
    }
  };

  // Auto-adjust close times when open times change
  useEffect(() => {
    DAYS_OF_WEEK.forEach((day) => {
      const openTime = watchedValues[`${day}_open_time` as keyof ScheduleFormValues] as number;
      const closeTime = watchedValues[`${day}_close_time` as keyof ScheduleFormValues] as number;

      if (openTime && closeTime && openTime >= closeTime) {
        const openHour = timeToHours(openTime);
        const openMinute = timeToMinutes(openTime);

        // Set close time to at least 15 minutes after open time
        let newCloseMinutes = openMinute + 15;
        let newCloseHour = openHour;

        if (newCloseMinutes >= 60) {
          newCloseHour = Math.min(openHour + 1, 23);
          newCloseMinutes = 0;
        }

        const newCloseTime = hoursMinutesToTime(newCloseHour, newCloseMinutes);
        setValue(`${day}_close_time` as keyof ScheduleFormValues, newCloseTime);
      }
    });
  }, [openTimes]);

  // Auto-adjust pause end times when pause start times change
  useEffect(() => {
    DAYS_OF_WEEK.forEach((day) => {
      const pauses = watchedValues[`${day}_pauses` as keyof ScheduleFormValues] as PauseItem[];

      if (pauses && Array.isArray(pauses)) {
        pauses.forEach((pause, index) => {
          if (pause.start && pause.end) {
            const startMinutes = timeStringToMinutes(pause.start);
            const endMinutes = timeStringToMinutes(pause.end);

            if (startMinutes >= endMinutes) {
              // Calculate the original duration (or default to 15 minutes if invalid)
              const originalDuration = endMinutes > startMinutes ? endMinutes - startMinutes : 15;

              // Add the duration to the new start time
              const newEndMinutes = startMinutes + originalDuration;
              const newEndHour = Math.floor(newEndMinutes / 60);
              const newEndMinute = newEndMinutes % 60;

              // Ensure we don't go past 23:59
              const finalEndHour = Math.min(newEndHour, 23);
              const finalEndMinute = finalEndHour === 23 && newEndMinute > 59 ? 59 : newEndMinute;

              const newEndTime = formatTime(
                finalEndHour.toString().padStart(2, "0"),
                finalEndMinute.toString().padStart(2, "0")
              );

              setValue(`${day}_pauses.${index}.end` as keyof ScheduleFormValues, newEndTime);
            }
          }
        });
      }
    });
  }, [pauseStartTimes]);

  return {
    selectors: { control, errors, isSubmitting: isPending, drawerRef, isEditMode },
    actions: { handleFormSubmit: onSubmit, handleStateChange },
  };
};
