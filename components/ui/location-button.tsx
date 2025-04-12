"use client";

import { LocationPinIcon } from "@/components/ui/icons/location-pin-icon";
import { FC } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";

export const LocationButton: FC = () => {
  const {
    selectors: { city, isLoading, error },
    actions: { handleRequestLocation },
  } = useGeolocation();

  return (
    <div className="flex items-center gap-2 py-2 px-3 bg-brand-medium rounded-b-2xl w-[260px] max-md:hidden">
      <LocationPinIcon className="w-6 h-6 text-neutral-white" />
      <div className="flex flex-col w-full">
        <span className="text-sm font-medium text-neutral-white mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
          {isLoading ? "Locating..." : error || city || "Location unavailable"}
        </span>
        <button
          type="button"
          data-label="changer de location"
          className="text-sm font-medium text-neutral-white underline text-left"
          onClick={handleRequestLocation}
        >
          changer de location
        </button>
      </div>
    </div>
  );
};
