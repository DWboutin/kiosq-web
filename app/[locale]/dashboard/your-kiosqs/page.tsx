import { DashboardProfileKiosqs } from "@/components/client-pages/dashboard-profile-kiosqs/dashboard-profile-kiosqs";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { KiosqFormDrawer } from "@/features/kiosq-form-drawer/kiosq-form-drawer";
import { cacheKeys } from "@/utils/cache-keys";
import { Profile } from "@/utils/factories/profiles-factory";
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

const getUserProfileIdKiosqs = async (profileId: string) => {
  const response = await fetchServerAuthenticated(
    `${getBaseUrl()}/api/users/current/profiles/${profileId}/kiosqs`,
    {
      next: {
        tags: [cacheKeys.currentUserProfileIdKiosqs.list(profileId).tag],
        revalidate: cacheKeys.currentUserProfileIdKiosqs.list(profileId).revalidate,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user profile's kiosqs");
  }

  const data = await response.json();
  const kiosqs = data.kiosqs;

  return kiosqs;
};

export const generateMetadata = async () => {
  const t = await getTranslations("AdminKiosqPage");
  return {
    title: t("title"),
    description: t("description"),
  };
};

export default async function YourKiosqsPage() {
  const t = await getTranslations("AdminKiosqPage");
  const profiles = await getUserProfiles();
  const vendorProfiles = profiles.filter((profile: Profile) => profile.type === "vendor");
  const kiosqs = vendorProfiles[0]?.id ? await getUserProfileIdKiosqs(vendorProfiles[0].id) : [];

  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeading
        title={t("title")}
        description={t("description")}
        cta={<KiosqFormDrawer />}
      />
      <div className="flex flex-col flex-1">
        <DashboardProfileKiosqs kiosqsData={kiosqs} profileId={vendorProfiles[0]?.id} />
      </div>
    </div>
  );
}
