import { getVendorProfileFromSlug } from "@/utils/requests/get-vendor-profile-from-slug";
import { Locales } from "@/types/app";
import { VendorProfileHeader } from "@/components/sections/vendor-profile-header";

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string; locale: Locales }>;
}) {
  const { slug, locale } = await params;
  const vendor = await getVendorProfileFromSlug(slug, locale);

  return (
    <VendorProfileHeader
      kiosqs={vendor.kiosqs}
      profileImage={vendor.profileImage}
      bannerImage={vendor.bannerImage}
      nameTranslations={vendor.nameTranslations}
      facebookPageUrl={vendor.facebookPageUrl}
      instagramPageUrl={vendor.instagramPageUrl}
      tiktokPageUrl={vendor.tiktokPageUrl}
      xPageUrl={vendor.xPageUrl}
      locale={locale}
    />
  );
}
