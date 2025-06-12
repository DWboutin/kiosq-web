"use client";

import { AdminProductIdCta } from "@/components/sections/admin-product-id-cta";
import { DashboardPageManagementHeading } from "@/components/sections/dashboard-page-management-heading";
import { ProductChecklist } from "@/components/sections/product-checklist";
import { BadgeCategory } from "@/components/ui/badge-category";
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
      <div className="flex flex-col gap-2">
        <DashboardPageManagementHeading
          title={product.nameTranslations}
          description={product.descriptionTranslations}
          productCategory={product.category}
          cta={
            <AdminProductIdCta
              productId={productId}
              entityName={product.nameTranslations[locale]}
              status={product.status}
              createdAt={product.createdAt}
              updatedAt={product.updatedAt}
            />
          }
        />
        <div className="flex flex-row justify-between gap-2">
          <div className="flex flex-col gap-2">
            <BadgeCategory productCategory={product.category} />
            <ProductChecklist checklistTranslations={product.checklistTranslations} isAdmin />
          </div>
        </div>
      </div>
      <pre>{locale}</pre>
      <pre>{JSON.stringify(product, null, 2)}</pre>
    </>
  );
};
