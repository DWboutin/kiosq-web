import { CategoriesTable } from "@/features/categories-table/categories-table";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { ProductCategoryFormDrawer } from "@/features/product-category-form-drawer/product-category-form-drawer";
import { Locales } from "@/types/app";
import { adminProductCategoriesFactory } from "@/utils/factories/admin-product-categories-factory";
import { cacheKeys } from "@/utils/cache-keys";
import { getBaseUrl } from "@/utils/get-base-url";
import { getTranslations } from "next-intl/server";
import { fetchServerAuthenticated } from "@/utils/fetch-server-authenticated";

const getProductCategories = async (locale: Locales) => {
  try {
    const response = await fetchServerAuthenticated(`${getBaseUrl()}/api/categories`, {
      next: {
        revalidate: cacheKeys.productCategories.list.revalidate,
        tags: [cacheKeys.productCategories.list.tag],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch product categories");
    }

    const data = await response.json();

    return adminProductCategoriesFactory(data.categories, locale);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    throw new Error("Failed request for product categories");
  }
};

export const generateMetadata = async () => {
  const t = await getTranslations("DashboardAdminCategoriesHeader");

  return {
    title: t("title"),
    description: t("description"),
  };
};

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
