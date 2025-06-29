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
    timezone: "America/Toronto",
    monday_is_open: true,
    monday_open_time: 9,
    monday_close_time: 17,
    monday_pauses: [],
    tuesday_is_open: true,
    tuesday_open_time: 9,
    tuesday_close_time: 17,
    tuesday_pauses: [],
    wednesday_is_open: true,
    wednesday_open_time: 9,
    wednesday_close_time: 17,
    wednesday_pauses: [],
    thursday_is_open: true,
    thursday_open_time: 9,
    thursday_close_time: 21,
    thursday_pauses: [],
    friday_is_open: true,
    friday_open_time: 9,
    friday_close_time: 21,
    friday_pauses: [],
    saturday_is_open: true,
    saturday_open_time: 9,
    saturday_close_time: 17,
    saturday_pauses: [],
    sunday_is_open: true,
    sunday_open_time: 9,
    sunday_close_time: 17,
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
        scheduleData: data,
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
