import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRef, useState, useEffect } from "react";
import { ModalRef } from "@/components/ui/modal";
import {
  createLocationManagerFormSchema,
  LocationManagerFormValues,
} from "@/features/location-manager/utils/location-manager-validation-schema";
import { geocodeAddressWithFallback } from "@/utils/geocoding";
import { useLocationManagerContext } from "@/features/location-manager/location-manager-provider";
import { getStoredData, saveDataToStorage } from "@/utils/local-storage";

export const LOCATION_MANAGER_STORAGE_KEY = "location-manager-form-data";

const locationManagerDefaultValues: LocationManagerFormValues = {
  streetAddress: "",
  city: "",
  postalCode: "",
  state: "",
  country: "",
  radiusKm: 100, // Default to 100km
};

export const useLocationManagerModal = () => {
  const t = useTranslations();
  const modalRef = useRef<ModalRef>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validationSchema = createLocationManagerFormSchema(t);
  const { userLocation, handleSetUserLocation } = useLocationManagerContext();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocationManagerFormValues>({
    defaultValues: locationManagerDefaultValues,
    resolver: zodResolver(validationSchema) as Resolver<LocationManagerFormValues>,
  });

  // Load stored data on mount
  useEffect(() => {
    const storedData = getStoredData(LOCATION_MANAGER_STORAGE_KEY, locationManagerDefaultValues);
    reset(storedData);
  }, [userLocation]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      const geocodeData = await geocodeAddressWithFallback(
        data.streetAddress,
        data.city,
        data.state,
        data.country
      );

      if (geocodeData) {
        saveDataToStorage(LOCATION_MANAGER_STORAGE_KEY, data);
        handleSetUserLocation(
          {
            latitude: geocodeData.latitude,
            longitude: geocodeData.longitude,
          },
          data.city,
          data.radiusKm
        );
      }

      modalRef.current?.close();
      reset();
    } catch (error) {
      console.error("Failed to save location:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleOpenModal = () => {
    modalRef.current?.open();
  };

  const handleCloseModal = () => {
    reset();
    modalRef.current?.close();
  };

  return {
    selectors: {
      control,
      errors,
      isSubmitting,
      modalRef,
    },
    actions: {
      handleFormSubmit: onSubmit,
      handleOpenModal,
      handleCloseModal,
    },
  };
};
