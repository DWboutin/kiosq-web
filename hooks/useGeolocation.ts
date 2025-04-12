import { useQuery } from "@tanstack/react-query";

const getCityFromCoords = async (latitude: number, longitude: number) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
    {
      headers: {
        "User-Agent": "Kiosq Web App", // Required by Nominatim's usage policy
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch location data");
  }

  const data = await response.json();
  return data.address?.city ?? data.address?.town ?? data.address?.village ?? null;
};

const getLocation = async (): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const city = await getCityFromCoords(position.coords.latitude, position.coords.longitude);
          resolve(city);
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(error)
    );
  });
};

export const useGeolocation = () => {
  const {
    data: city,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["geolocation"],
    queryFn: getLocation,
    retry: 2,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const handleRequestLocation = async () => {
    if (!navigator.geolocation) {
      return { success: false, error: "Geolocation is not supported" };
    }

    try {
      await refetch();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get location",
      };
    }
  };

  return {
    selectors: {
      city,
      isLoading,
      error: error?.message ?? null,
    },
    actions: {
      handleRequestLocation,
    },
  };
};
