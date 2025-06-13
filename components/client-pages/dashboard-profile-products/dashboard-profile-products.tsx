"use client";

import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { useCurrentUserProfileIdProducts } from "@/hooks/use-current-user-profile-id-products";
import { CardAdminProduct } from "@/components/ui/card-admin-product";
import { useLocale } from "next-intl";
import { Locales } from "@/types/app";

export const DashboardProfileProducts = () => {
  const locale = useLocale() as Locales;
  const {
    selectors: { profiles, isLoading: profilesLoading, error: profilesError },
  } = useCurrentUserProfiles();
  const selectedProfileId = profiles[0]?.id;
  const {
    selectors: { products, isLoading: productsLoading, error: productsError },
  } = useCurrentUserProfileIdProducts(selectedProfileId);

  if (profilesLoading || productsLoading) {
    return <div>Loading...</div>;
  }

  if (profilesError || productsError) {
    return <div>Error: {profilesError?.message || productsError?.message}</div>;
  }

  return (
    <div className="flex flex-wrap gap-6 justify-start mt-6">
      {products.map((product) => (
        <CardAdminProduct
          key={product.id}
          id={product.id}
          title={product.nameTranslations[locale]}
          description={product.descriptionTranslations[locale]}
        />
      ))}
    </div>
  );
};
