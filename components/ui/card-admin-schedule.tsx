import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Locales } from "@/types/app";
import { AuthenticatedUserSchedule } from "@/utils/factories/authenticated-user-schedules-factory";
import { useLocale, useTranslations } from "next-intl";
import { FC } from "react";

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

const getDaySchedule = (schedule: AuthenticatedUserSchedule, day: string) => {
  const daySchedule =
    schedule[
      day as keyof Pick<
        AuthenticatedUserSchedule,
        "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
      >
    ];

  if (!daySchedule?.isOpen) return "Closed";
  return `${formatTime(daySchedule.openTime)} - ${formatTime(daySchedule.closeTime)}`;
};

const days = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const CardAdminSchedule: FC<CardAdminScheduleProps> = ({ schedule }) => {
  const locale = useLocale() as Locales;
  const t = useTranslations("DashboardSchedules");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{schedule.nameTranslations[locale]}</CardTitle>
        <CardDescription>
          {t("scheduleDescription")} • Timezone: {schedule.timezone}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => (
            <div key={day.key} className="flex justify-between items-center p-3 border rounded-lg">
              <span className="font-medium">{day.label}</span>
              <span className="text-sm text-muted-foreground">
                {getDaySchedule(schedule, day.key)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
