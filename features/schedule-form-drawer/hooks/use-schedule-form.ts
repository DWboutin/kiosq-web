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
import { useEffect } from "react";
import {
  AuthenticatedUserSchedule,
  PauseTime,
} from "@/utils/factories/authenticated-user-schedules-factory";

type UseScheduleFormProps = {
  profileId: string;
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

const getScheduleDefaultValues = ({
  scheduleValues,
  locale,
}: {
  scheduleValues: AuthenticatedUserSchedule | null;
  locale: Locales;
}): ScheduleFormValues => {
  const filteredNameTranslations = scheduleValues?.nameTranslations
    ? Object.fromEntries(
        Object.entries(scheduleValues.nameTranslations).filter(
          ([key, value]) => key !== locale && value !== ""
        )
      )
    : {};

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

  const defaultValues = getScheduleDefaultValues({ scheduleValues, locale });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema) as Resolver<ScheduleFormValues>,
  });

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
      toast.success(message);

      await queryClient.invalidateQueries({
        queryKey: cacheKeys.currentUserSchedules.list(profileId).queryKey,
      });

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

  return {
    selectors: { control, errors, isSubmitting: isPending, drawerRef, isEditMode },
    actions: { handleFormSubmit: onSubmit, handleStateChange },
  };
};
