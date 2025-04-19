import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { ProductCategoryFormDrawer } from "@/features/product-category-form-drawer/product-category-form-drawer";

export default function DashboardAdminCategoriesPage() {
  return (
    <div>
      <DashboardPageHeading
        title="Categories"
        description="Gestion des catégories"
        headingLevel="h2"
        cta={<ProductCategoryFormDrawer />}
      />
    </div>
  );
}
