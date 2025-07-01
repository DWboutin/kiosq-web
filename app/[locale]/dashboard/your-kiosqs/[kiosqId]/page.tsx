import { DashboardProfileKiosqById } from "@/components/client-pages/dashboard-profile-kiosq-by-id/dashboard-profile-kiosq-by-id";
import { AdminKiosqIdCta } from "@/components/sections/admin-kiosq-id-cta";
import { DashboardPageManagementHeading } from "@/components/sections/dashboard-page-management-heading";
import { Locales } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { fetchServerAuthenticated } from "@/utils/fetch-server-authenticated";
import { getBaseUrl } from "@/utils/get-base-url";
import { getLocale } from "next-intl/server";

const getKiosq = async (kiosqId: string) => {
  const response = await fetchServerAuthenticated(
    `${getBaseUrl()}/api/users/current/kiosq/${kiosqId}`,
    {
      next: {
        tags: [cacheKeys.currentUserKiosqById(kiosqId).tag],
        revalidate: cacheKeys.currentUserKiosqById(kiosqId).revalidate,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch kiosq");
  }

  const data = await response.json();
  const kiosq = data.kiosq;

  return kiosq;
};

export const generateMetadata = async ({ params }: { params: Promise<{ kiosqId: string }> }) => {
  const locale = (await getLocale()) as Locales;
  const { kiosqId } = await params;
  const kiosq = await getKiosq(kiosqId);

  return {
    title: kiosq.nameTranslations[locale],
    description: kiosq.descriptionTranslations[locale],
  };
};

export default async function KiosqPage({ params }: { params: Promise<{ kiosqId: string }> }) {
  const { kiosqId } = await params;
  const kiosq = await getKiosq(kiosqId);

  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageManagementHeading
        title={kiosq.nameTranslations}
        description={kiosq.descriptionTranslations}
        cta={
          <AdminKiosqIdCta
            kiosqId={kiosqId}
            kiosqData={kiosq}
            createdAt={kiosq.createdAt}
            updatedAt={kiosq.updatedAt}
          />
        }
      />
      <DashboardProfileKiosqById kiosqData={kiosq} />
    </div>
  );
}
