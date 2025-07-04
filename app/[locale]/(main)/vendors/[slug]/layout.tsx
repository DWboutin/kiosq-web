import { ReactNode } from "react";
import { Locales } from "@/types/app";
import { getVendorProfileFromSlug } from "@/utils/requests/get-vendor-profile-from-slug";
import { VendorProfileHeader } from "@/components/sections/vendor-profile-header";
import { VendorProfileNavigation } from "@/components/sections/vendor-profile-navigation";

export default async function VendorProfileLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string; locale: Locales }>;
  children: ReactNode;
}) {
  const { slug, locale } = await params;
  const vendor = await getVendorProfileFromSlug(slug, locale);

  return (
    <>
      <div className="flex flex-col gap-4 min-md:border-b-8 min-md:border-neutral-lightest">
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
        <VendorProfileNavigation slug={slug} locale={locale} />
      </div>
      {children}
    </>
  );
}
