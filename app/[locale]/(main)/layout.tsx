import { Header } from "@/components/sections/header";
import { CategoryLinks } from "@/components/sections/category-links";
import { LocationManagerProvider } from "@/features/location-manager/location-manager-provider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header>
        <CategoryLinks />
      </Header>
      {children}
    </>
  );
}
