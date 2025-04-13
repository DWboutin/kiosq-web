import { DashboardMenu } from "@/components/sections/dashboard-menu";
import { Header } from "@/components/sections/header";
import { DashboardBreadcrumb } from "@/features/dashboard-breadcrumb/dashboard-breadcrumb";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header>
        <DashboardBreadcrumb />
      </Header>
      <div className="relative flex flex-col bg-neutral-lightest border-t border-neutral-light px-28 min-h-screen">
        <div className="absolute top-6 left-4">
          <DashboardMenu />
        </div>
        <div className="flex flex-col container mx-auto">{children}</div>
      </div>
    </>
  );
}
