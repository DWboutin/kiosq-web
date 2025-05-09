import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { getTranslations } from "next-intl/server";

export default async function DashboardYourStoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations("DashboardYourStoreHeader");

  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeading title={t("title")} description={t("description")} />
      <div className="flex flex-col flex-1">{children}</div>
    </div>
  );
}
