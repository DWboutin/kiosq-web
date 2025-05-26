import { getUserProductById } from "@/actions/get-user-product-by-id";
import { AdminProductIdCta } from "@/components/sections/admin-product-id-cta";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { Locales } from "@/types/app";
import { getLocale } from "next-intl/server";

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const locale = (await getLocale()) as Locales;
  const data = await getUserProductById(productId);

  return (
    <>
      <DashboardPageHeading
        title={data.nameTranslations[locale]}
        description={data.descriptionTranslations[locale]}
        cta={
          <AdminProductIdCta
            productId={productId}
            entityName={data.nameTranslations[locale]}
            status={data.status}
          />
        }
      />
      <pre>{locale}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
