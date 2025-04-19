import { DashboardAdminTabs } from "@/components/sections/dashboard-admin-tabs";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";

export default function DashboardAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeading
        title="Admin"
        description="Gestions des données de l'application Kiosq"
      />
      <div className="flex flex-col flex-1">
        <DashboardAdminTabs />
        {children}
      </div>
    </div>
  );
}
