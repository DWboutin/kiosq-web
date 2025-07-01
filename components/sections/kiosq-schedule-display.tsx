import { Badge } from "@/components/ui/badge";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { Locales, DayOfWeek } from "@/types/app";
import { AuthenticatedUserSchedule } from "@/utils/factories/authenticated-user-schedules-factory";
import { useLocale, useTranslations } from "next-intl";
import { FC } from "react";
import { ClockIcon } from "lucide-react";
import { EmptyHourglassIcon } from "@/components/ui/icons/empty-hourglass-icon";

type KiosqScheduleDisplayProps = {
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

const getCurrentDay = (): DayOfWeek => {
  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date().getDay()];
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

const getDayStatus = (schedule: AuthenticatedUserSchedule, day: DayOfWeek) => {
  const daySchedule = schedule[day];
  return daySchedule?.isOpen ? "open" : "closed";
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

export const KiosqScheduleDisplay: FC<KiosqScheduleDisplayProps> = ({ schedule }) => {
  const locale = useLocale() as Locales;
  const t = useTranslations("DashboardSchedules");
  const currentDay = getCurrentDay();
  const currentDayStatus = getDayStatus(schedule, currentDay);

  return (
    <div className="space-y-4 border-t pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">{`${t("schedule")}: ${
            schedule.nameTranslations[locale]
          }`}</h3>
        </div>
        {schedule.isDefault && (
          <Badge variant="secondary" className="bg-brand-medium text-white text-xs">
            {t("defaultSchedule")}
          </Badge>
        )}
      </div>

      {/* Current Day Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium capitalize">{t(currentDay)}</span>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                currentDayStatus === "open" ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {getDaySchedule(schedule, currentDay, t)}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">{t("weeklySchedule")}</span>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isToday = day.key === currentDay;
            const status = getDayStatus(schedule, day.key);
            const daySchedule = schedule[day.key];
            const hasPauses = daySchedule?.pauses && daySchedule.pauses.length > 0;

            return (
              <div
                key={day.key}
                className={`text-center p-2 rounded text-xs space-y-1 ${
                  isToday ? "bg-brand-light text-brand-dark font-medium" : "bg-gray-50"
                }`}
              >
                <div className="font-medium">{t(day.key).slice(0, 3)}</div>

                <div className="flex flex-row items-center justify-center gap-2">
                  {/* Open/Close Hours */}
                  <div className="text-xs text-muted-foreground leading-tight">
                    {status === "open"
                      ? `${formatTime(daySchedule.openTime)}-${formatTime(daySchedule.closeTime)}`
                      : t("closed")}
                  </div>
                  {hasPauses && (
                    <TooltipContainer
                      content={
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{t("pauses")}:</div>
                          {daySchedule.pauses!.map((pause, index) => (
                            <div key={index} className="text-xs">
                              {formatPauseTime(pause.start)} - {formatPauseTime(pause.end)}
                            </div>
                          ))}
                        </div>
                      }
                    >
                      <EmptyHourglassIcon className="h-3 w-3 text-yellow-500" />
                    </TooltipContainer>
                  )}
                </div>

                {/* Status dot and pause icon */}
                <div className="flex items-center justify-center gap-1">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      status === "open" ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
