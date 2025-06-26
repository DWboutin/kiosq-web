export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address?: string;
}

/**
 * Geocode an address using OpenStreetMap Nominatim API (free alternative to Google Maps)
 * @param address Full address string
 * @param city City name
 * @param state State/province name
 * @param country Country code (2 letters)
 * @returns Promise with latitude and longitude
 */
export const geocodeAddress = async (
  address: string,
  city: string,
  state: string,
  country: string
): Promise<GeocodeResult | null> => {
  try {
    // Construct the full address string
    const fullAddress = `${address}, ${city}, ${state}, ${country}`;

    // Use Nominatim API (OpenStreetMap's geocoding service)
    const encodedAddress = encodeURIComponent(fullAddress);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "KiosqApp/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formatted_address: result.display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/**
 * Alternative geocoding function using a different service if needed
 * This can be used as a fallback or with different API keys
 */
export const geocodeAddressWithFallback = async (
  address: string,
  city: string,
  state: string,
  country: string
): Promise<GeocodeResult | null> => {
  // First try with Nominatim
  const result = await geocodeAddress(address, city, state, country);

  if (result) {
    return result;
  }

  // Could add other geocoding services here as fallbacks
  // For example: Google Maps, MapBox, etc.

  return null;
};
