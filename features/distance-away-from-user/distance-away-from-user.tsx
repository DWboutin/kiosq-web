"use client";

import { useMemo } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type DistanceAwayFromUserProps = {
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
};

// Function to calculate distance between two coordinates using Haversine formula
const getDistance = (lat1?: number, lon1?: number, lat2?: number, lon2?: number): number | null => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

export const DistanceAwayFromUser = ({
  latitude,
  longitude,
  className,
}: DistanceAwayFromUserProps) => {
  const t = useTranslations("DistanceAwayFromUser");
  const {
    selectors: { coords },
  } = useGeolocation();

  const distance = useMemo(() => {
    if (!latitude || !longitude || !coords?.latitude || !coords?.longitude) {
      return null;
    }

    return getDistance(coords?.latitude, coords?.longitude, latitude, longitude);
  }, [coords, latitude, longitude]);

  if (distance === null) {
    return <div className={cn(className)}>{t("distanceUnavailable")}</div>;
  }

  if (distance < 1) {
    return <div className={cn(className)}>{t("lessThan1Km")}</div>;
  }

  return <div className={cn(className)}>{t("kmAway", { distance })}</div>;
};
