import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { KiosqFormDrawer } from "@/features/kiosq-form-drawer/kiosq-form-drawer";
import { getTranslations } from "next-intl/server";

export default async function DashboardYourStoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("DashboardYourKiosqsHeader");

  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeading
        title={t("title")}
        description={t("description")}
        cta={<KiosqFormDrawer />}
      />
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
