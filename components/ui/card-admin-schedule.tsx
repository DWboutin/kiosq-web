import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RawSchedule } from "@/types/app";
import { useTranslations } from "next-intl";
import { FC } from "react";

type CardAdminScheduleProps = {
  schedule: RawSchedule;
};

export const CardAdminSchedule: FC<CardAdminScheduleProps> = ({ schedule }) => {
  const t = useTranslations("DashboardSchedules");

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

  const getDaySchedule = (schedule: RawSchedule, day: string) => {
    const isOpenKey = `${day}_is_open` as keyof typeof schedule;
    const openTimeKey = `${day}_open_time` as keyof typeof schedule;
    const closeTimeKey = `${day}_close_time` as keyof typeof schedule;

    const isOpen = schedule[isOpenKey] as boolean;
    const openTime = schedule[openTimeKey] as number | null;
    const closeTime = schedule[closeTimeKey] as number | null;

    if (!isOpen) return "Closed";
    return `${formatTime(openTime)} - ${formatTime(closeTime)}`;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("scheduleTitle")}</CardTitle>
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
