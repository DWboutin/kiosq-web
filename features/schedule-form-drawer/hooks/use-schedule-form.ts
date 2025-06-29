import { Locales } from "@/types/app";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  createScheduleFormSchema,
  ScheduleFormValues,
} from "@/features/schedule-form-drawer/utils/schedule-form-validation-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SideFormDrawerRef } from "@/components/ui/side-form-drawer";
import { useRef } from "react";
import { createSchedule } from "@/actions/create-schedule";
import { cacheKeys } from "@/utils/cache-keys";

type UseScheduleFormProps = {
  profileId: string;
};

const getScheduleDefaultValues = (): ScheduleFormValues => {
  return {
    name: "",
    name_translations: {},
    is_default: true,
    timezone: "America/Toronto",
    monday_is_open: true,
    monday_open_time: 900, // 9:00 AM
    monday_close_time: 1700, // 5:00 PM
    monday_pauses: [],
    tuesday_is_open: true,
    tuesday_open_time: 900, // 9:00 AM
    tuesday_close_time: 1700, // 5:00 PM
    tuesday_pauses: [],
    wednesday_is_open: true,
    wednesday_open_time: 900, // 9:00 AM
    wednesday_close_time: 1700, // 5:00 PM
    wednesday_pauses: [],
    thursday_is_open: true,
    thursday_open_time: 900, // 9:00 AM
    thursday_close_time: 2100, // 9:00 PM
    thursday_pauses: [],
    friday_is_open: true,
    friday_open_time: 900, // 9:00 AM
    friday_close_time: 2100, // 9:00 PM
    friday_pauses: [],
    saturday_is_open: true,
    saturday_open_time: 900, // 9:00 AM
    saturday_close_time: 1700, // 5:00 PM
    saturday_pauses: [],
    sunday_is_open: false,
    sunday_open_time: 900, // 9:00 AM
    sunday_close_time: 1700, // 5:00 PM
    sunday_pauses: [],
  };
};

export const useScheduleForm = ({ profileId }: UseScheduleFormProps) => {
  const t = useTranslations();
  const drawerRef = useRef<SideFormDrawerRef>(null);
  const locale = useLocale() as Locales;
  const queryClient = useQueryClient();
  const validationSchema = createScheduleFormSchema(locale, t);

  const defaultValues = getScheduleDefaultValues();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema) as Resolver<ScheduleFormValues>,
  });

  const { mutate: submitSchedule, isPending } = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      return await createSchedule({
        profileId,
        scheduleData: { ...data, locale },
      });
    },
    onSuccess: async () => {
      const message = t("ScheduleForm.created");
      toast.success(message);

      await queryClient.invalidateQueries({
        queryKey: cacheKeys.currentUserSchedules.list(profileId).queryKey,
      });

      drawerRef.current?.close();
    },
    onError: (error: Error) => {
      const message = t("ScheduleForm.updatedError");
      toast.error(message);
      console.error("Schedule form error:", error);
    },
  });

  const onSubmit = handleSubmit((data) => {
    submitSchedule(data);
  });

  return {
    selectors: { control, errors, isSubmitting: isPending, drawerRef },
    actions: { handleFormSubmit: onSubmit },
  };
};
