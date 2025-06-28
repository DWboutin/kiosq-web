import { getUserProfiles } from "@/actions/get-user-profiles";
import { DashboardYourStore } from "@/components/client-pages/dashboard-your-store/dashboard-your-store";
import { AdminVendorProfileCta } from "@/components/sections/admin-vendor-profile-cta";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { getTranslations } from "next-intl/server";

export default async function YourStorePage() {
  const t = await getTranslations("DashboardYourStoreHeader");
  const profiles = await getUserProfiles();
  const vendorProfiles = profiles.filter((profile) => profile.type === "vendor");

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
        <DashboardYourStore />
      </div>
    </div>
  );
}
