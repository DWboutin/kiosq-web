"use client";

import { LocationPinIcon } from "@/components/ui/icons/location-pin-icon";
import { FC } from "react";
import { useTranslations } from "next-intl";
import { useLocationManagerContext } from "@/features/location-manager/location-manager-provider";
import { RefreshIcon } from "@/components/ui/icons/refresh-icon";
import { Button } from "@/components/ui/button";
import { TooltipContainer } from "@/components/ui/tooltip-container";

const useLocationDisplay = () => {
  const t = useTranslations("Header");
  const { city, userCity, isLoading, cityError, geolocationError } = useLocationManagerContext();

  const hasError = (!!cityError || !!geolocationError) && !userCity;

  if (isLoading) return t("locationButtonSearching");
  if (hasError) return t("locationButtonError");
  if (userCity) return userCity;
  if (city) return city;

  return t("locationButtonUnavailable");
};

export const LocationButton: FC = () => {
  const t = useTranslations("Header");
  const {
    city,
    userCity,
    userSearchRadius,
    canRetryLocation,
    handleRequestLocation,
    handleOpenModal,
    handleClearUserLocation,
  } = useLocationManagerContext();
  const locationText = useLocationDisplay();

  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-brand-medium rounded-b-2xl w-[260px] max-md:hidden">
      <LocationPinIcon className="w-6 h-6 text-neutral-white" />
      <div className="flex flex-col w-full min-w-0">
        <div className="flex flex-row items-center gap-2 min-w-0">
          <div className="flex flex-row items-center gap-2 w-full min-w-0">
            <TooltipContainer content={locationText}>
              <span
                className="text-sm font-medium text-neutral-white mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0"
                aria-live="polite"
              >
                {locationText}
              </span>
            </TooltipContainer>
            <span className="text-sm font-medium text-neutral-white mb-0.5 flex-shrink-0">
              ({userSearchRadius} km)
            </span>
          </div>
          {!city && !userCity && canRetryLocation && (
            <Button
              variant="ghost"
              aria-label={t("locationButton")}
              onClick={handleRequestLocation}
              className="p-1 h-6 w-6 rounded-full group"
            >
              <RefreshIcon className="w-4 h-4 text-neutral-white group-hover:text-brand-medium" />
            </Button>
          )}
        </div>
        {!userCity && (
          <button
            type="button"
            aria-label={t("locationButton")}
            className="text-sm font-medium text-neutral-white underline text-left cursor-pointer hover:no-underline"
            onClick={handleOpenModal}
          >
            {t("locationButton")}
          </button>
        )}
        {userCity && (
          <button
            type="button"
            aria-label={t("locationButton")}
            className="text-sm font-medium text-neutral-white underline text-left cursor-pointer hover:no-underline"
            onClick={handleClearUserLocation}
          >
            {t("locationButtonClear")}
          </button>
        )}
      </div>
    </div>
  );
};
