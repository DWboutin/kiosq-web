import { DashboardSchedules } from "@/components/client-pages/dashboard-schedules/dashboard-schedules";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { cacheKeys } from "@/utils/cache-keys";
import { AuthenticatedUserProfile } from "@/utils/factories/authenticated-user-profiles-factory";
import { AuthenticatedUserSchedule } from "@/utils/factories/authenticated-user-schedules-factory";
import { fetchServerAuthenticated } from "@/utils/fetch-server-authenticated";
import { getBaseUrl } from "@/utils/get-base-url";
import { getTranslations } from "next-intl/server";
import { ScheduleDrawerProvider } from "@/features/schedule-drawer-provider/schedule-drawer-provider";
import { ScheduleFormDrawer } from "@/features/schedule-form-drawer/schedule-form-drawer";

const getUserProfiles = async () => {
  const response = await fetchServerAuthenticated(`${getBaseUrl()}/api/users/current/profiles`, {
    next: {
      tags: [cacheKeys.currentUserProfiles.list.tag],
      revalidate: cacheKeys.currentUserProfiles.list.revalidate,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profiles");
  }

  const data = await response.json();
  const profiles = data.profiles;

  return profiles;
};

const getUserProfileSchedules = async (profileId: string): Promise<AuthenticatedUserSchedule[]> => {
  const response = await fetchServerAuthenticated(
    `${getBaseUrl()}/api/users/current/profiles/${profileId}/schedules`,
    {
      next: {
        tags: [cacheKeys.currentUserSchedules.list(profileId).tag],
        revalidate: cacheKeys.currentUserSchedules.list(profileId).revalidate,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user profile schedules");
  }

  const data = await response.json();
  const schedules = data.schedules;

  return schedules;
};

export const generateMetadata = async () => {
  const t = await getTranslations("DashboardScheduleHeader");

  return {
    title: t("title"),
    description: t("description"),
  };
};

export default async function SchedulePage() {
  const t = await getTranslations("DashboardScheduleHeader");
  const profiles = await getUserProfiles();
  const vendorProfiles = profiles.filter(
    (profile: AuthenticatedUserProfile) => profile.type === "vendor"
  );
  const schedules = vendorProfiles[0]?.id
    ? await getUserProfileSchedules(vendorProfiles[0].id)
    : [];

  return (
    <ScheduleDrawerProvider>
      <div className="flex flex-col flex-1 gap-10">
        <DashboardPageHeading
          title={t("title")}
          description={t("description")}
          cta={<ScheduleFormDrawer profileId={vendorProfiles[0].id} />}
        />
        <div className="flex flex-col flex-1">
          <DashboardSchedules profileId={vendorProfiles[0].id} schedulesData={schedules} />
        </div>
      </div>
    </ScheduleDrawerProvider>
  );
}
