import { DashboardProfileKiosqById } from "@/components/client-pages/dashboard-profile-kiosq-by-id/dashboard-profile-kiosq-by-id";
import { DashboardPageHeading } from "@/components/sections/dashboard-page-heading";
import { KiosqFormDrawer } from "@/features/kiosq-form-drawer/kiosq-form-drawer";
import { Locales, RawKiosq } from "@/types/app";
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

  const getKiosqName = (kiosq: RawKiosq) => {
    const translations = kiosq.name_translations as Record<string, string>;
    return translations[locale] || translations.en || translations.fr || "Unnamed Kiosq";
  };

  return {
    title: getKiosqName(kiosq),
    description: kiosq.description_translations?.[locale] || "Kiosq details",
  };
};

export default async function KiosqPage({ params }: { params: Promise<{ kiosqId: string }> }) {
  const locale = await getLocale();
  const { kiosqId } = await params;
  const kiosq = await getKiosq(kiosqId);

  return (
    <div className="flex flex-col flex-1 gap-10">
      <DashboardPageHeading
        title={kiosq.name_translations[locale]}
        description={kiosq.description_translations[locale]}
        cta={<KiosqFormDrawer editMode kiosqId={kiosqId} kiosqData={kiosq} />}
      />
      <DashboardProfileKiosqById kiosqData={kiosq} />
    </div>
  );
}
