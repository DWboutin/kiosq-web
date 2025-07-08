export type UserGeolocation = {
  latitude: number;
  longitude: number;
};

export type GeolocationError = {
  code: number;
  message: string;
  type: "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "NOT_SUPPORTED";
};

const getGeolocationErrorMessage = (error: GeolocationPositionError): GeolocationError => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        code: 1,
        message:
          "Location access was denied. Please enable location permissions to use this feature.",
        type: "PERMISSION_DENIED",
      };
    case error.POSITION_UNAVAILABLE:
      return {
        code: 2,
        message:
          "Location information is unavailable. Please check your internet connection and try again.",
        type: "POSITION_UNAVAILABLE",
      };
    case error.TIMEOUT:
      return {
        code: 3,
        message: "Location request timed out. Please try again.",
        type: "TIMEOUT",
      };
    default:
      return {
        code: error.code,
        message: error.message || "An unknown location error occurred.",
        type: "POSITION_UNAVAILABLE",
      };
  }
};

export const getGeolocation = async (): Promise<UserGeolocation | null> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const error: GeolocationError = {
        code: 0,
        message: "Geolocation is not supported by this browser.",
        type: "NOT_SUPPORTED",
      };
      reject(error);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 60000, // 1 minute
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        const geolocationError = getGeolocationErrorMessage(error);
        reject(geolocationError);
      },
      options
    );
  });
};
