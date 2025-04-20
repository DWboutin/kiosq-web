import { CategoriesTable } from "@/components/sections/categories-table";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { ProductCategoryFormDrawer } from "@/features/product-category-form-drawer/product-category-form-drawer";
import { Locales } from "@/types/app";
import { getProductCategories } from "@/utils/requests/get-product-categories";

export default async function DashboardAdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: Locales }>;
}) {
  const { locale } = await params;
  const categories = await getProductCategories(locale);

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeading
        title="Categories"
        description="Gestion des catégories"
        headingLevel="h2"
        cta={<ProductCategoryFormDrawer />}
      />
      <CategoriesTable data={categories} />
    </div>
  );
}
