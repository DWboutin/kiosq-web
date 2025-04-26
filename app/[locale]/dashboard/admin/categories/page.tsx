import { CategoriesTable } from "@/features/categories-table/categories-table";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { ProductCategoryFormDrawer } from "@/features/product-category-form-drawer/product-category-form-drawer";
import { Locales } from "@/types/app";
import { getProductCategories } from "@/utils/requests/get-product-categories";
import { getTranslations } from "next-intl/server";

export default async function DashboardAdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: Locales }>;
}) {
  const t = await getTranslations("DashboardAdminCategoriesHeader");
  const { locale } = await params;
  const categories = await getProductCategories(locale);

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeading
        title={t("title")}
        description={t("description")}
        headingLevel="h2"
        cta={<ProductCategoryFormDrawer />}
      />
      <CategoriesTable data={categories} />
    </div>
  );
}
