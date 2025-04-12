export const getCityFromCoords = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
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
