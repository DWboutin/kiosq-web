"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleFormDrawer } from "@/features/schedule-form-drawer/schedule-form-drawer";
import { CardAdminSchedule } from "@/components/ui/card-admin-schedule";
import { useCurrentUserProfileIdSchedules } from "@/hooks/use-current-user-profile-id-schedules";
import { AuthenticatedUserSchedule } from "@/utils/factories/authenticated-user-schedules-factory";
import { useTranslations } from "next-intl";
import { FC } from "react";

type DashboardSchedulesProps = {
  profileId: string;
  schedulesData: AuthenticatedUserSchedule[];
};

export const DashboardSchedules: FC<DashboardSchedulesProps> = ({ profileId, schedulesData }) => {
  const t = useTranslations("DashboardSchedules");
  const {
    selectors: { schedules },
  } = useCurrentUserProfileIdSchedules(schedulesData, profileId);

  const hasSchedule = schedules.length > 0;

  if (!hasSchedule) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>{t("noScheduleTitle")}</CardTitle>
          <CardDescription>{t("noScheduleDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScheduleFormDrawer profileId={profileId} />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {schedules.map((schedule) => (
        <CardAdminSchedule key={schedule.id} schedule={schedule} />
      ))}
    </div>
  );
};
