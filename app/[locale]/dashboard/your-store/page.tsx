import { DashboardYourStore } from "@/components/client-pages/dashboard-your-store/dashboard-your-store";
import { AdminVendorProfileCta } from "@/components/sections/admin-vendor-profile-cta";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { cacheKeys } from "@/utils/cache-keys";
import { AuthenticatedUserProfile } from "@/utils/factories/authenticated-user-profiles-factory";
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

export const generateMetadata = async () => {
  const t = await getTranslations("DashboardYourStoreHeader");

  return {
    title: t("title"),
    description: t("description"),
  };
};

export default async function YourStorePage() {
  const t = await getTranslations("DashboardYourStoreHeader");
  const profiles = await getUserProfiles();
  const vendorProfiles = profiles.filter(
    (profile: AuthenticatedUserProfile) => profile.type === "vendor"
  );

  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeading
        title={t("title")}
        description={t("description")}
        cta={
          vendorProfiles.length > 0 ? (
            <AdminVendorProfileCta
              profileId={vendorProfiles[0].id}
              createdAt={vendorProfiles[0].createdAt}
              updatedAt={vendorProfiles[0].updatedAt}
            />
          ) : null
        }
      />
      <div className="flex flex-col flex-1">
        <DashboardYourStore profilesData={profiles} />
      </div>
    </div>
  );
}
