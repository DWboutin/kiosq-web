"use client";

import { useCurrentUserProfileIdProducts } from "@/hooks/use-current-user-profile-id-products";
import { CardAdminProduct } from "@/components/ui/card-admin-product";
import { useLocale } from "next-intl";
import { Locales } from "@/types/app";
import { AuthenticatedUserProductWithVariantsAndPrices } from "@/utils/factories/authenticated-user-product-factory";

type DashboardProfileProductsProps = {
  productsData: AuthenticatedUserProductWithVariantsAndPrices[];
  profileId: string;
};

export const DashboardProfileProducts = ({
  productsData,
  profileId,
}: DashboardProfileProductsProps) => {
  const locale = useLocale() as Locales;
  const {
    selectors: { products },
  } = useCurrentUserProfileIdProducts(productsData, profileId);

  return (
    <div className="flex flex-wrap gap-6 justify-start mt-6">
      {products.map((product) => (
        <CardAdminProduct
          key={product.id}
          id={product.id}
          title={product.nameTranslations[locale]}
          description={product.descriptionTranslations[locale]}
          status={product.status}
          variants={product.productVariants}
        />
      ))}
    </div>
  );
};
