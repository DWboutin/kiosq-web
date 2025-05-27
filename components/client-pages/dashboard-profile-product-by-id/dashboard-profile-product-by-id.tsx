"use client";

import { AdminProductIdCta } from "@/components/sections/admin-product-id-cta";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { useCurrentUserProductById } from "@/hooks/use-current-user-product-by-id";
import { Locales } from "@/types/app";
import { useLocale } from "next-intl";
import { FC } from "react";

type DashboardProfileProductByIdProps = {
  productId: string;
};

export const DashboardProfileProductById: FC<DashboardProfileProductByIdProps> = ({
  productId,
}) => {
  const {
    selectors: { product, isLoading, error },
  } = useCurrentUserProductById(productId);
  const locale = useLocale() as Locales;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <DashboardPageHeading
        title={product.nameTranslations[locale]}
        description={product.descriptionTranslations[locale]}
        cta={
          <AdminProductIdCta
            productId={productId}
            entityName={product.nameTranslations[locale]}
            status={product.status}
          />
        }
      />
      <pre>{locale}</pre>
      <pre>{JSON.stringify(product, null, 2)}</pre>
    </>
  );
};
