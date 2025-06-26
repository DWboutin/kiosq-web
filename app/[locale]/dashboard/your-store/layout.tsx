import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { getTranslations } from "next-intl/server";
import { VendorProfileFormDrawer } from "@/features/vendor-profile-form-drawer/vendor-profile-form-drawer";
import { getUserProfiles } from "@/actions/get-user-profiles";

export default async function DashboardYourStoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            <VendorProfileFormDrawer profileId={vendorProfiles[0].id} />
          ) : null
        }
      />
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
