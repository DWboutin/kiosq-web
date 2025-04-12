export type UserGeolocation = {
  latitude: number;
  longitude: number;
};

export const getGeolocation = async (): Promise<UserGeolocation | null> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

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
      (error) => reject(error)
    );
  });
};
