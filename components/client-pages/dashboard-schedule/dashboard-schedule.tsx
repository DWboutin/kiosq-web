"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleFormDrawer } from "@/features/schedule-form-drawer/schedule-form-drawer";
import { CreateProfileWizard } from "@/features/create-profile-wizard/create-profile-wizard";
import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { Profile } from "@/utils/factories/profiles-factory";
import { RawSchedule } from "@/types/app";
import { useTranslations } from "next-intl";
import { FC } from "react";

type DashboardScheduleProps = {
  profilesData: Profile[];
  schedulesData: RawSchedule[];
};

export const DashboardSchedule: FC<DashboardScheduleProps> = ({ profilesData, schedulesData }) => {
  const t = useTranslations("DashboardSchedule");
  const {
    selectors: { profiles, isLoading, error },
  } = useCurrentUserProfiles({ profilesData });
  const vendorProfiles = profiles.filter((profile) => profile.type === "vendor");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (vendorProfiles.length === 0) {
    return <CreateProfileWizard />;
  }

  const firstVendorProfile = vendorProfiles[0];
  const hasSchedule = schedulesData.length > 0;

  if (!hasSchedule) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>{t("noScheduleTitle")}</CardTitle>
          <CardDescription>{t("noScheduleDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScheduleFormDrawer profileId={firstVendorProfile.id} />
        </CardContent>
      </Card>
    );
  }

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
    <div className="flex flex-col gap-6">
      {schedulesData.map((schedule) => (
        <Card key={schedule.id}>
          <CardHeader>
            <CardTitle>{t("scheduleTitle")}</CardTitle>
            <CardDescription>
              {t("scheduleDescription")} • Timezone: {schedule.timezone}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {days.map((day) => (
                <div
                  key={day.key}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <span className="font-medium">{day.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {getDaySchedule(schedule, day.key)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
