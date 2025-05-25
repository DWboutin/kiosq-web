import { getUserProductById } from "@/actions/get-user-product-by-id";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { ButtonBrand } from "@/components/ui/button-brand";
import { EditPencilIcon } from "@/components/ui/icons/edit-pencil-icon";
import { PublishedStatusManagement } from "@/features/published-status-management/published-status-management";
import { Locales } from "@/types/app";
import { getLocale, getTranslations } from "next-intl/server";

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
          <div className="flex flex-row gap-2">
            <PublishedStatusManagement status={data.status} />
            <ButtonBrand>
              <span className="flex flex-row items-center gap-2">
                <EditPencilIcon className="size-5" />
                Modifier
              </span>
            </ButtonBrand>
          </div>
        }
      />
      <pre>{locale}</pre>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
