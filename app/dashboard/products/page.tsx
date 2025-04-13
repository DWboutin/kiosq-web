import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { AddProductFormDrawer } from "@/features/add-product-form-drawer/add-product-form-drawer";

export default function ProductsPage() {
  return (
    <div className="flex flex-col flex-1">
      <DashboardPageHeading
        title="Produits"
        description="Gérer facilement vos produits, leurs inventaire et leur disponibilité selon la saison"
        cta={<AddProductFormDrawer />}
      />
    </div>
  );
}
