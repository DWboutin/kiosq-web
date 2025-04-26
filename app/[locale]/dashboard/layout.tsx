import { DashboardMenu } from "@/features/dashboard-menu/dashboard-menu";
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
      <div className="relative flex flex-col bg-neutral-lightest border-t border-neutral-light px-5 max-md:px-3 min-lg:pl-28 max-lg:pr-4 min-h-screen">
        <div className="absolute top-6 left-4 max-md:left-0 max-lg:hidden">
          <DashboardMenu />
        </div>
        <div className="flex flex-col pb-20">{children}</div>
      </div>
    </>
  );
}
