import { DayOfWeek } from "@/types/app";
import { AuthenticatedUserSchedule } from "@/utils/factories/authenticated-user-schedules-factory";
import { useTranslations } from "next-intl";
import { FC } from "react";

type ScheduleTooltipDisplayProps = {
  schedule: AuthenticatedUserSchedule;
  compact?: boolean;
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

const formatPauseTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const min = parseInt(minutes);

  if (min === 0) {
    return `${hour}h`;
  } else {
    return `${hour}h${min.toString().padStart(2, "0")}`;
  }
};

const getPausesText = (schedule: AuthenticatedUserSchedule, day: DayOfWeek) => {
  const daySchedule = schedule[day];

  if (!daySchedule?.pauses || daySchedule.pauses.length === 0) return "";

  const pausesText = daySchedule.pauses
    .map((pause) => `${formatPauseTime(pause.start)}-${formatPauseTime(pause.end)}`)
    .join(", ");

  return ` (${pausesText})`;
};

const days: { key: DayOfWeek; shortLabel: string }[] = [
  { key: "monday", shortLabel: "Mon" },
  { key: "tuesday", shortLabel: "Tue" },
  { key: "wednesday", shortLabel: "Wed" },
  { key: "thursday", shortLabel: "Thu" },
  { key: "friday", shortLabel: "Fri" },
  { key: "saturday", shortLabel: "Sat" },
  { key: "sunday", shortLabel: "Sun" },
];

export const ScheduleTooltipDisplay: FC<ScheduleTooltipDisplayProps> = ({
  schedule,
  compact = false,
}) => {
  const t = useTranslations("DashboardSchedules");

  if (compact) {
    return (
      <div className="space-y-1 text-xs">
        <div className="font-medium text-sm mb-2">
          {schedule.nameTranslations.en || schedule.nameTranslations.fr}
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          {t("timezone")}: {schedule.timezone}
        </div>
        {days.map((day) => (
          <div key={day.key} className="flex justify-between items-start gap-2">
            <span className="font-medium text-xs min-w-[32px]">{day.shortLabel}:</span>
            <span className="text-xs text-right flex-1">
              {getDaySchedule(schedule, day.key, t)}
              {getPausesText(schedule, day.key)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="font-medium">
        {schedule.nameTranslations.en || schedule.nameTranslations.fr}
      </div>
      <div className="text-sm text-muted-foreground">
        {t("timezone")}: {schedule.timezone}
      </div>
      <div className="space-y-1">
        {days.map((day) => (
          <div key={day.key} className="flex justify-between items-center">
            <span className="font-medium text-sm">{t(day.key)}:</span>
            <span className="text-sm">
              {getDaySchedule(schedule, day.key, t)}
              {getPausesText(schedule, day.key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
