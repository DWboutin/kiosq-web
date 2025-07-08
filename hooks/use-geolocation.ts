import {
  getGeolocation,
  type UserGeolocation,
  type GeolocationError,
} from "@/utils/get-geolocation";
import { getCityFromCoords } from "@/utils/requests/get-city-from-coord";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useGeolocation = () => {
  const [coords, setCoords] = useState<UserGeolocation | null>(null);
  const [geolocationError, setGeolocationError] = useState<GeolocationError | null>(null);
  const {
    data: city = null,
    isLoading,
    error: cityError,
  } = useQuery({
    queryKey: ["geolocation"],
    queryFn: () => {
      if (!coords) throw new Error("Coordinates not available");
      return getCityFromCoords(coords.latitude, coords.longitude);
    },
    retry: 2,
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!coords?.latitude && !!coords?.longitude,
  });

  const handleRequestLocation = async () => {
    try {
      setGeolocationError(null);
      const localCoords = await getGeolocation();

      if (!localCoords) {
        throw new Error("Failed to get location");
      }

      if (!localCoords.latitude || !localCoords.longitude) {
        throw new Error("Failed to get location");
      }

      setCoords(localCoords);
    } catch (error) {
      const geolocationError = error as GeolocationError;
      setGeolocationError(geolocationError);
    }
  };

  useEffect(() => {
    handleRequestLocation();
  }, []);

  return {
    selectors: {
      city,
      coords,
      isLoading,
      cityError: cityError?.message ?? null,
      geolocationError,
      canRetryLocation:
        geolocationError?.type !== "PERMISSION_DENIED" &&
        geolocationError?.type !== "NOT_SUPPORTED",
    },
    actions: {
      handleRequestLocation,
    },
  };
};
