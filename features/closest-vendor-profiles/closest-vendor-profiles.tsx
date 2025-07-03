"use client";

import { useClosestVendorProfiles } from "@/hooks/use-closest-vendor-profiles";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Link } from "@/i18n/navigation";
import { Locales } from "@/types/app";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo } from "react";
import { MapView } from "@/components/ui/map-view";

export const ClosestVendorProfiles = () => {
  const t = useTranslations("ClosestVendorProfiles");
  const locale = useLocale() as Locales;
  const {
    selectors: { vendorProfiles, isLoading, error },
  } = useClosestVendorProfiles();
  const {
    selectors: { coords },
  } = useGeolocation();

  const uniqueVendorProfiles = useMemo(() => {
    return (vendorProfiles ?? [])
      .filter(
        (profile, index, self) => index === self.findIndex((t) => t.profileId === profile.profileId)
      )
      .filter(Boolean);
  }, [vendorProfiles]);

  const mapLocations = useMemo(() => {
    return (vendorProfiles ?? []).map((vendor) => ({
      latitude: vendor.kiosqLatitude,
      longitude: vendor.kiosqLongitude,
      title: vendor.kiosqNameTranslations[locale],
      description: `${vendor.profileNameTranslations[locale]} - ${
        vendor.kiosqAddress || vendor.kiosqCity || ""
      }`,
      id: vendor.kiosqId,
      imageUrl: vendor.profileImage ?? undefined,
    }));
  }, [vendorProfiles, locale]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          {t("title")} <span className="text-neutral-medium font-normal">{t("subTitle")}</span>
        </h2>
        <p className="text-gray-600">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          {t("title")} <span className="text-neutral-medium font-normal">{t("subTitle")}</span>
        </h2>
        <p>{t("error", { error: typeof error === "string" ? error : error.message })}</p>
      </div>
    );
  }

  if (uniqueVendorProfiles.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">{t("title")}</h2>
        <p>{t("noVendors")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-4 max-md:flex-col">
      <div className="flex flex-col w-1/2 gap-4 max-md:w-full">
        <h2 className="text-lg font-semibold mb-4">
          {t("title")} <span className="text-neutral-medium font-normal">{t("subTitle")}</span>
        </h2>

        <div className="flex flex-row flex-wrap gap-4">
          <div className="flex flex-row flex-wrap gap-4">
            {uniqueVendorProfiles.map((vendor) => (
              <Link
                href={`/profiles/${vendor.profileSlugTranslations[locale]}`}
                key={`${vendor.profileId}-${vendor.kiosqId}`}
                className="rounded-full shadow-md"
              >
                <Image
                  src={vendor.profileImage ?? ""}
                  alt={vendor.profileNameTranslations[locale]}
                  width={86}
                  height={86}
                  className="rounded-full"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="w-1/2 max-md:w-full shadow-md rounded-lg overflow-hidden">
        <MapView
          width="100%"
          height={300}
          locations={mapLocations}
          showUserLocation={true}
          userLatitude={coords?.latitude}
          userLongitude={coords?.longitude}
          className="border border-gray-200"
          withNavigationControl
          interactive
        />
      </div>
    </div>
  );
};
