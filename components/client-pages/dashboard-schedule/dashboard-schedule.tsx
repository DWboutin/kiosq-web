"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleFormDrawer } from "@/features/schedule-form-drawer/schedule-form-drawer";
import { CreateProfileWizard } from "@/features/create-profile-wizard/create-profile-wizard";
import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { Profile } from "@/utils/factories/profiles-factory";
import { useTranslations } from "next-intl";
import { FC } from "react";

type DashboardScheduleProps = {
  profilesData: Profile[];
};

export const DashboardSchedule: FC<DashboardScheduleProps> = ({ profilesData }) => {
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

  // TODO: Add hook to check if schedule exists for this profile
  const hasSchedule = false; // This will be replaced with actual schedule check

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

  return (
    <div className="flex flex-col gap-6">
      {/* Schedule content will be added here */}
      <Card>
        <CardHeader>
          <CardTitle>{t("scheduleTitle")}</CardTitle>
          <CardDescription>{t("scheduleDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Schedule display will be implemented here */}
          <p>{t("scheduleContent")}</p>
        </CardContent>
      </Card>
    </div>
  );
};
