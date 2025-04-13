import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { Button } from "@/components/ui/button";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";

export default function ProductsPage() {
  return (
    <div>
      <DashboardPageHeading
        title="Produits"
        description="Gérer facilement vos produits, leurs inventaire et leur disponibilité selon la saison"
        cta={
          <Button>
            <PlusSquareIcon className="size-5" />
            Ajouter un produit
          </Button>
        }
      />
    </div>
  );
}
