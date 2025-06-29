import { DashboardSchedule } from "@/components/client-pages/dashboard-schedule/dashboard-schedule";
import { AdminProfileScheduleCta } from "@/components/sections/admin-profile-schedule-cta";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { cacheKeys } from "@/utils/cache-keys";
import { Profile } from "@/utils/factories/profiles-factory";
import { RawSchedule } from "@/types/app";
import { fetchServerAuthenticated } from "@/utils/fetch-server-authenticated";
import { getBaseUrl } from "@/utils/get-base-url";
import { getTranslations } from "next-intl/server";

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

const getUserProfileSchedules = async (profileId: string): Promise<RawSchedule[]> => {
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
  const vendorProfiles = profiles.filter((profile: Profile) => profile.type === "vendor");
  const schedules = vendorProfiles[0]?.id
    ? await getUserProfileSchedules(vendorProfiles[0].id)
    : [];

  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeading
        title={t("title")}
        description={t("description")}
        cta={
          vendorProfiles.length > 0 ? (
            <AdminProfileScheduleCta
              profileId={vendorProfiles[0].id}
              createdAt={vendorProfiles[0].createdAt}
              updatedAt={vendorProfiles[0].updatedAt}
            />
          ) : null
        }
      />
      <div className="flex flex-col flex-1">
        <DashboardSchedule profilesData={profiles} schedulesData={schedules} />
      </div>
    </div>
  );
}
