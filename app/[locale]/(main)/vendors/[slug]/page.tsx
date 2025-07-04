import { getVendorProfileFromSlug } from "@/utils/requests/get-vendor-profile-from-slug";
import { Locales } from "@/types/app";
import Image from "next/image";

export default async function VendorPage({
  params,
}: {
  params: Promise<{ slug: string; locale: Locales }>;
}) {
  const { slug, locale } = await params;
  const vendor = await getVendorProfileFromSlug(slug, locale);

  return (
    <div className="flex flex-col">
      <Image
        src={vendor.bannerImage}
        alt={`${vendor.nameTranslations[locale]} banner`}
        width={1000}
        height={1000}
        className="w-full h-70 object-cover object-bottom"
      />
      <div className="container mx-auto relative">
        <div className="flex flex-row gap-4">
          <Image
            src={vendor.profileImage}
            alt={`${vendor.nameTranslations[locale]} profile image`}
            width={182}
            height={182}
            className="object-cover object-center rounded-full mt-[-91px] shadow-md"
          />
          <div className="flex flex-col gap-2 py-5">
            <h1 className="text-2xl font-bold">{vendor.nameTranslations[locale]}</h1>
            <p className="text-sm text-gray-500">{vendor.descriptionTranslations[locale]}</p>
          </div>
        </div>
        <pre>{JSON.stringify(vendor, null, 2)}</pre>
      </div>
    </div>
  );
}
