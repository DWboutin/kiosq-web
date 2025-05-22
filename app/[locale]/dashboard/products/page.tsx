import { DashboardProfileProducts } from "@/components/client-pages/dashboard-profile-products/dashboard-profile-products";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { ProductFormDrawer } from "@/features/product-form-drawer/product-form-drawer";

export default function DashboardProductsPage() {
  return (
    <div className="flex flex-col flex-1">
      <DashboardPageHeading
        title="Produits"
        description="Gérer facilement vos produits, leurs inventaire et leur disponibilité selon la saison"
        cta={<ProductFormDrawer />}
      />
      <DashboardProfileProducts />
    </div>
  );
}
