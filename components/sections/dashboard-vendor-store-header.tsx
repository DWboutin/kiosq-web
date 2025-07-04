import { AdminVendorBannerImage } from "@/features/admin-vendor-banner-image/admin-vendor-banner-image";
import { AdminVendorProfileImage } from "@/features/admin-vendor-profile-image/admin-vendor-profile-image";
import { SocialButton } from "@/components/ui/social-button";
import { FacebookIcon } from "@/components/ui/icons/facebook-icon";
import { InstagramIcon } from "@/components/ui/icons/instagram-icon";
import { TikTokIcon } from "@/components/ui/icons/tiktok-icon";
import { XIcon } from "@/components/ui/icons/x-icon";
import { Locales } from "@/types/app";
import { useLocale } from "next-intl";
import { FC } from "react";
import { SocialLinks } from "./social-links";

type DashboardVendorStoreHeaderProps = {
  profileId: string;
  bannerImageUrl: string | null;
  profileImageUrl: string | null;
  nameTranslations: Record<Locales, string>;
  descriptionTranslations: Record<Locales, string>;
  facebookPageUrl: string | null;
  instagramPageUrl: string | null;
  tiktokPageUrl: string | null;
  xPageUrl: string | null;
};

export const DashboardVendorStoreHeader: FC<DashboardVendorStoreHeaderProps> = ({
  profileId,
  bannerImageUrl,
  profileImageUrl,
  nameTranslations,
  descriptionTranslations,
  facebookPageUrl,
  instagramPageUrl,
  tiktokPageUrl,
  xPageUrl,
}) => {
  const locale = useLocale();
  const name = nameTranslations[locale as Locales];
  const description = descriptionTranslations[locale as Locales];

  return (
    <div className="relative flex flex-col flex-1 max-w-[1200px] mx-auto overflow-hidden rounded-2xl bg-neutral-white shadow-md">
      <AdminVendorBannerImage bannerImageUrl={bannerImageUrl} profileId={profileId} />
      <div className="flex flex-row flex-1 gap-5 z-10">
        <AdminVendorProfileImage profileId={profileId} profileImageUrl={profileImageUrl} />
        <div className="flex flex-1 flex-row gap-2 items-start justify-between">
          <div className="flex flex-col flex-1 py-5">
            <h2 className="text-2xl font-bold text-neutral-black">{name}</h2>
            <p className="text-sm text-neutral-medium">{description}</p>
          </div>
          <SocialLinks
            facebookPageUrl={facebookPageUrl}
            instagramPageUrl={instagramPageUrl}
            tiktokPageUrl={tiktokPageUrl}
            xPageUrl={xPageUrl}
            className="py-5 pr-5"
          />
        </div>
      </div>
    </div>
  );
};
