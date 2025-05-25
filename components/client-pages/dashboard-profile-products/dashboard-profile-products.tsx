"use client";

import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { useCurrentUserProfileIdProducts } from "@/hooks/use-current-user-profile-id-products";
import { CardAdminProduct } from "@/components/ui/card-admin-product";

export const DashboardProfileProducts = () => {
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
    <>
      <CardAdminProduct />
      <pre>{JSON.stringify(products, null, 2)}</pre>
    </>
  );
};
