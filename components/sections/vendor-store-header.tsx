import { AdminVendorBannerImage } from "@/features/admin-vendor-banner-image/admin-vendor-banner-image";
import { Locales } from "@/types/app";
import { useLocale } from "next-intl";
import Image from "next/image";
import { FC } from "react";

type VendorStoreHeaderProps = {
  profileId: string;
  bannerImageUrl: string;
  nameTranslations: Record<Locales, string>;
  descriptionTranslations: Record<Locales, string>;
};

export const VendorStoreHeader: FC<VendorStoreHeaderProps> = ({
  profileId,
  bannerImageUrl,
  nameTranslations,
  descriptionTranslations,
}) => {
  const locale = useLocale();
  const name = nameTranslations[locale as Locales];
  const description = descriptionTranslations[locale as Locales];

  return (
    <div className="relative flex flex-col flex-1 max-w-[1200px] mx-auto overflow-hidden rounded-2xl bg-neutral-white shadow-md">
      <AdminVendorBannerImage bannerImageUrl={bannerImageUrl} profileId={profileId} />
      <div className="flex flex-row flex-1 gap-5 z-10">
        <Image
          src="/placeholders/182x182.jpg"
          alt="Profile picture"
          width={182}
          height={182}
          className="rounded-full border-2 border-neutral-white mt-[-92px] ml-5"
        />
        <div className="flex flex-col flex-1 py-5">
          <h2 className="text-2xl font-bold text-neutral-black">{name}</h2>
          <p className="text-sm text-neutral-medium">{description}</p>
        </div>
      </div>
    </div>
  );
};
