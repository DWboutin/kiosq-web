import { MapView } from "@/components/ui/map-view";
import { SocialLinks } from "@/components/sections/social-links";
import { LocationPinIcon } from "@/components/ui/icons/location-pin-icon";
import Image from "next/image";
import { FC } from "react";
import { Kiosq } from "@/utils/factories/kiosqs-factory";
import { Locales } from "@/types/app";

type VendorProfileHeaderProps = {
  kiosqs?: Kiosq[];
  profileImage: string | null;
  bannerImage: string | null;
  nameTranslations: Record<Locales, string>;
  facebookPageUrl: string | null;
  instagramPageUrl: string | null;
  tiktokPageUrl: string | null;
  xPageUrl: string | null;
  locale: Locales;
};

export const VendorProfileHeader: FC<VendorProfileHeaderProps> = ({
  kiosqs,
  profileImage,
  bannerImage,
  nameTranslations,
  facebookPageUrl,
  instagramPageUrl,
  tiktokPageUrl,
  xPageUrl,
  locale,
}) => {
  const defaultKiosq = kiosqs?.find((kiosq) => kiosq.isDefault);

  return (
    <div className="flex flex-col">
      <Image
        src={bannerImage ?? "/images/placeholder/1200x400.png"}
        alt={`${nameTranslations[locale]} banner`}
        width={1000}
        height={1000}
        className="w-full h-70 object-cover object-bottom"
      />
      <div className="container mx-auto relative max-sm:px-4">
        <div className="flex flex-row max-xl:flex-col gap-4 justify-between">
          <div className="flex flex-1 flex-row gap-4 max-lg:flex-col justify-between">
            <div className="flex flex-1 flex-row gap-4 justify-between relative">
              <div className="w-[182px] h-[182px] rounded-full absolute top-[-44px] left-0 shadow-md overflow-hidden flex-shrink-0">
                <Image
                  src={profileImage ?? "/images/placeholder/182x182.png"}
                  alt={`${nameTranslations[locale]} profile image`}
                  width={182}
                  height={182}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="flex flex-1 flex-row gap-4 justify-between min-lg:ml-[200px] max-lg:mt-36">
                <div className="flex flex-col gap-2 py-5">
                  <h1 className="text-2xl font-bold">{nameTranslations[locale]}</h1>
                  <p className="text-md text-neutral-medium">{`${defaultKiosq?.address}, ${defaultKiosq?.city}, ${defaultKiosq?.state}, ${defaultKiosq?.country}`}</p>
                  <div className="flex flex-row gap-4 items-center">
                    <div className="flex flex-row gap-2 items-center">
                      <LocationPinIcon className="w-5 h-5 text-neutral-medium" />
                      <p className="text-md text-neutral-medium">1 km away</p>
                    </div>
                    <div className="w-1 h-1 bg-neutral-light rounded-full" />
                    <div className="flex flex-row gap-2 items-center">
                      <LocationPinIcon className="w-5 h-5 text-neutral-medium" />
                      <p className="text-md text-neutral-medium">1 km away</p>
                    </div>
                  </div>
                </div>
              </div>
              <SocialLinks
                facebookPageUrl={facebookPageUrl}
                instagramPageUrl={instagramPageUrl}
                tiktokPageUrl={tiktokPageUrl}
                xPageUrl={xPageUrl}
                className="py-5"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full xl:w-[320px]">
            <MapView
              width="100%"
              height={220}
              locations={
                kiosqs
                  ?.filter((kiosq) => kiosq.latitude && kiosq.longitude)
                  .map((kiosq) => ({
                    latitude: kiosq.latitude!,
                    longitude: kiosq.longitude!,
                    title: kiosq.nameTranslations[locale],
                    description: `${kiosq.address}, ${kiosq.city}, ${kiosq.state}, ${kiosq.country}`,
                    id: kiosq.id,
                    imageUrl: kiosq.imageUrl || undefined,
                  })) || []
              }
              interactive={true}
              withNavigationControl={true}
              className="rounded-lg shadow-md mt-[-90px] max-xl:mt-0 xl:max-w-[320px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
