"use client";

import { AdminProductIdCta } from "@/components/sections/admin-product-id-cta";
import { DashboardPageManagementHeading } from "@/components/sections/dashboard-page-management-heading";
import { ProductChecklist } from "@/components/sections/product-checklist";
import { BadgeCategory } from "@/components/ui/badge-category";
import { CardAdminProductVariant } from "@/components/ui/card-admin-product-variant";
import { useCurrentUserProductById } from "@/hooks/use-current-user-product-by-id";
import { Locales } from "@/types/app";
import { AuthenticatedUserProductWithVariantsAndPrices } from "@/utils/factories/authenticated-user-product-factory";
import { useLocale, useTranslations } from "next-intl";
import { FC } from "react";

type DashboardProfileProductByIdProps = {
  productData: AuthenticatedUserProductWithVariantsAndPrices;
};

export const DashboardProfileProductById: FC<DashboardProfileProductByIdProps> = ({
  productData,
}) => {
  const {
    selectors: { product, isLoading, error },
  } = useCurrentUserProductById(productData);
  const t = useTranslations("AdminProductPage");
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <DashboardPageManagementHeading
          title={product.nameTranslations}
          description={product.descriptionTranslations}
          productCategory={product.category}
          cta={
            <AdminProductIdCta
              productId={product.id}
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

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">{t("variantsTitle")}</h2>
        <div className="flex flex-wrap gap-4">
          {product.productVariants.map((variant) => {
            const price = variant.productPrices[0]?.basePrice || 0;

            return (
              <CardAdminProductVariant
                key={variant.id}
                title={`${variant.quantity} ${variant.unit}`}
                price={price}
                imageUrl={variant.imageUrl}
                isDefault={variant.isDefault}
              />
            );
          })}
        </div>
      </div>

      <pre>{locale}</pre>
      <pre>{JSON.stringify(product, null, 2)}</pre>
    </div>
  );
};
