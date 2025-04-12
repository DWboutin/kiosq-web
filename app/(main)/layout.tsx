import { Header } from "@/components/header/header";
import { CategoryLinks } from "@/components/sections/category-links";

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
