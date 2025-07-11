import { Badge } from "@/components/ui/badge";
import { ButtonBrand } from "@/components/ui/button-brand";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonWithConfirmationModal } from "@/features/button-with-confirmation-modal/button-with-confirmation-modal";
import { useScheduleDrawerContext } from "@/features/schedule-drawer-provider/schedule-drawer-provider";
import { Locales, DayOfWeek } from "@/types/app";
import { AuthenticatedUserSchedule } from "@/utils/factories/authenticated-user-schedules-factory";
import { useLocale, useTranslations } from "next-intl";
import { FC } from "react";
import { TrashIcon } from "lucide-react";
import { deleteSchedule } from "@/actions/delete-schedule";
import { toast } from "sonner";
import { EmptyHourglassIcon } from "@/components/ui/icons/empty-hourglass-icon";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { useSchedulesInvalidator } from "@/utils/invalidators-hooks/use-schedules-invalidator";

type CardAdminScheduleProps = {
  schedule: AuthenticatedUserSchedule;
};

const formatTime = (time: number | null) => {
  if (time === null) return "—";
  const hours = Math.floor(time / 100);
  const minutes = time % 100;

  if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  }
};

const getDaySchedule = (
  schedule: AuthenticatedUserSchedule,
  day: DayOfWeek,
  t: ReturnType<typeof useTranslations>
) => {
  const daySchedule = schedule[day];

  if (!daySchedule?.isOpen) return t("closed");
  return `${formatTime(daySchedule.openTime)} - ${formatTime(daySchedule.closeTime)}`;
};

const hasPauses = (schedule: AuthenticatedUserSchedule, day: DayOfWeek) => {
  const daySchedule = schedule[day];

  return daySchedule?.pauses && daySchedule.pauses.length > 0;
};

const formatPauseTime = (time: string) => {
  // Convert "HH:MM" format to display format
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const min = parseInt(minutes);

  if (min === 0) {
    return `${hour}h`;
  } else {
    return `${hour}h${min.toString().padStart(2, "0")}`;
  }
};

const getPausesList = (schedule: AuthenticatedUserSchedule, day: DayOfWeek) => {
  const daySchedule = schedule[day];

  if (!daySchedule?.pauses) return [];

  return daySchedule.pauses.map(
    (pause) => `${formatPauseTime(pause.start)} - ${formatPauseTime(pause.end)}`
  );
};

const days: { key: DayOfWeek }[] = [
  { key: "monday" },
  { key: "tuesday" },
  { key: "wednesday" },
  { key: "thursday" },
  { key: "friday" },
  { key: "saturday" },
  { key: "sunday" },
];

export const CardAdminSchedule: FC<CardAdminScheduleProps> = ({ schedule }) => {
  const locale = useLocale() as Locales;
  const t = useTranslations("DashboardSchedules");
  const { drawerRef, handleSetScheduleValues } = useScheduleDrawerContext();
  const { invalidate: invalidateSchedules } = useSchedulesInvalidator();

  const handleEditSchedule = () => {
    handleSetScheduleValues(schedule);
    drawerRef.current?.open();
  };

  const handleDeleteSchedule = async () => {
    try {
      await deleteSchedule({ scheduleId: schedule.id });
      toast.success(t("scheduleDeletedSuccess", { name: schedule.nameTranslations[locale] }));
      await invalidateSchedules({ profileId: schedule.profileId });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error(t("scheduleDeletedError"));
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-row items-center justify-between gap-2">
          <div className="flex-1">{schedule.nameTranslations[locale]}</div>
          {schedule.isDefault && (
            <Badge className="bg-brand-medium text-white">{t("defaultSchedule")}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {t("timezone")}: {schedule.timezone}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {days.map((day) => (
            <div key={day.key} className="flex justify-between items-center p-2 border rounded">
              <span className="font-medium text-sm">{t(day.key)}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {getDaySchedule(schedule, day.key, t)}
                </span>
                {hasPauses(schedule, day.key) && (
                  <TooltipContainer
                    content={
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{t("pauses")}:</div>
                        {getPausesList(schedule, day.key).map((pause, index) => (
                          <div key={index} className="text-xs">
                            {pause}
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <EmptyHourglassIcon className="h-4 w-4 text-yellow-500" />
                  </TooltipContainer>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {!schedule.isDefault && (
          <ButtonWithConfirmationModal
            title={t("deleteModalTitle")}
            description={t("deleteModalDescription")}
            confirmLabel={t("deleteModalButton")}
            cancelLabel={t("cancelModalButton")}
            action={handleDeleteSchedule}
          >
            <ButtonBrand variant="destructive">
              <TrashIcon className="h-4 w-4 mr-2" />
              {t("deleteSchedule")}
            </ButtonBrand>
          </ButtonWithConfirmationModal>
        )}
        <ButtonBrand onClick={handleEditSchedule}>{t("editSchedule")}</ButtonBrand>
      </CardFooter>
    </Card>
  );
};
