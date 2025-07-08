"use client";

import { ModalRef } from "@/components/ui/modal";
import { LocationManagerModal } from "@/features/location-manager/components/location-manager-modal";
import { useGeolocation } from "@/hooks/use-geolocation";
import { GeolocationError, UserGeolocation } from "@/utils/get-geolocation";
import { createContext, useContext, ReactNode, useRef, useState, useEffect } from "react";
import { getStoredData, removeStoredData, saveDataToStorage } from "@/utils/local-storage";
import { LOCATION_MANAGER_STORAGE_KEY } from "@/features/location-manager/hooks/use-location-manager-modal";

const LOCATION_USER_LOCATION_STORAGE_KEY = "location-user-location";

interface LocationManagerContextValues {
  modalRef: React.RefObject<ModalRef | null>;
  userLocation: UserGeolocation | null;
  userCity: string | null;
  userSearchRadius: number;
  city: string | null;
  isLoading: boolean;
  cityError: string | null;
  geolocationError: GeolocationError | null;
  canRetryLocation: boolean;
  handleRequestLocation: () => void;
  handleOpenModal: () => void;
  handleSetUserLocation: (location: UserGeolocation, city: string, searchRadius: number) => void;
  handleClearUserLocation: () => void;
}

const LocationManagerContext = createContext({} as LocationManagerContextValues);

export const useLocationManagerContext = () => {
  const context = useContext(LocationManagerContext);

  if (context === undefined) {
    throw new Error("LocationManagerContext must be used within LocationManagerProvider");
  }

  return context;
};

interface LocationManagerProviderProps {
  children: ReactNode;
}

export const LocationManagerProvider = ({ children }: LocationManagerProviderProps) => {
  const modalRef = useRef<ModalRef | null>(null);
  const [userLocation, setUserLocation] = useState<UserGeolocation | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userSearchRadius, setUserSearchRadius] = useState<number>(100);
  const {
    selectors: { city, coords, isLoading, cityError, geolocationError, canRetryLocation },
    actions: { handleRequestLocation },
  } = useGeolocation();

  const handleOpenModal = () => {
    modalRef.current?.open();
  };

  const handleSetUserLocation = (location: UserGeolocation, city: string, searchRadius: number) => {
    setUserLocation(location);
    setUserCity(city);
    setUserSearchRadius(searchRadius);
    saveDataToStorage(LOCATION_USER_LOCATION_STORAGE_KEY, {
      latitude: location.latitude,
      longitude: location.longitude,
      city,
      searchRadius,
    });
  };

  const handleClearUserLocation = () => {
    setUserLocation(null);
    setUserCity(null);
    setUserSearchRadius(100);
    removeStoredData(LOCATION_USER_LOCATION_STORAGE_KEY);
    removeStoredData(LOCATION_MANAGER_STORAGE_KEY);
  };

  useEffect(() => {
    const storedData = getStoredData(LOCATION_USER_LOCATION_STORAGE_KEY, {
      latitude: null,
      longitude: null,
      city: null,
      searchRadius: 100,
    });

    if (storedData && storedData.latitude !== null && storedData.longitude !== null) {
      setUserLocation({
        latitude: storedData.latitude,
        longitude: storedData.longitude,
      });
      setUserCity(storedData.city);
      setUserSearchRadius(storedData.searchRadius);
    }
  }, []);

  return (
    <LocationManagerContext.Provider
      value={{
        modalRef,
        userLocation: userLocation ?? coords,
        userCity,
        userSearchRadius,
        city,
        isLoading,
        cityError,
        geolocationError,
        canRetryLocation,
        handleRequestLocation,
        handleOpenModal,
        handleSetUserLocation,
        handleClearUserLocation,
      }}
    >
      {children}
      <LocationManagerModal ref={modalRef} />
    </LocationManagerContext.Provider>
  );
};
