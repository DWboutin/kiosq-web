import { DashboardProfileProducts } from "@/components/client-pages/dashboard-profile-products/dashboard-profile-products";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { ProductFormDrawer } from "@/features/product-form-drawer/product-form-drawer";
import { cacheKeys } from "@/utils/cache-keys";
import { fetchServerAuthenticated } from "@/utils/fetch-server-authenticated";
import { getBaseUrl } from "@/utils/get-base-url";

const getUserProfiles = async () => {
  const response = await fetchServerAuthenticated(`${getBaseUrl()}/api/users/current/profiles`, {
    next: {
      tags: [cacheKeys.currentUserProfiles.list.tag],
      revalidate: cacheKeys.currentUserProfiles.list.revalidate,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profiles");
  }

  const data = await response.json();
  const profiles = data.profiles;

  return profiles;
};

const getUserProfileIdProducts = async (profileId: string) => {
  const response = await fetchServerAuthenticated(
    `${getBaseUrl()}/api/users/current/profiles/${profileId}/products`,
    {
      next: {
        tags: [cacheKeys.currentUserProfileIdProducts.list(profileId).tag],
        revalidate: cacheKeys.currentUserProfileIdProducts.list(profileId).revalidate,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user profile's products");
  }

  const data = await response.json();
  const products = data.products;

  return products;
};

export const metadata = {
  title: "Produits",
  description:
    "Gérer facilement vos produits, leurs inventaire et leur disponibilité selon la saison",
};

export default async function DashboardProductsPage() {
  const profiles = await getUserProfiles();
  const products = await getUserProfileIdProducts(profiles[0]?.id);

  return (
    <div className="flex flex-col flex-1">
      <DashboardPageHeading
        title="Produits"
        description="Gérer facilement vos produits, leurs inventaire et leur disponibilité selon la saison"
        cta={<ProductFormDrawer />}
      />
      <DashboardProfileProducts productsData={products} profileId={profiles[0]?.id} />
    </div>
  );
}
