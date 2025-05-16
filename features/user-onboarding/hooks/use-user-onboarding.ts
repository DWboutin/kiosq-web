import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getGeolocation } from "@/utils/get-geolocation";
import { useUserStore } from "@/stores/user-store";
import {
  createUserOnboardingSchema,
  UserOnboardingValues,
} from "../utils/create-user-onboarding-schema";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { setUserOnboardingValues } from "@/actions/set-user-onboarding-values";
import { toast } from "sonner";

export const useUserOnboarding = () => {
  const t = useTranslations("UserOnboarding");
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const refreshUserData = useUserStore((state) => state.refreshUserData);
  const validationSchema = createUserOnboardingSchema(t);
  const [isOpen, setIsOpen] = useState(true);

  const {
    control,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    getValues,
    watch,
  } = useForm<UserOnboardingValues>({
    mode: "onTouched",
    resolver: zodResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      postalCode: "",
      geolocation: {
        latitude: 0,
        longitude: 0,
      },
      useGeolocation: false,
      searchRadius: 100,
      categories: [],
      userType: "User",
    },
  });

  const { mutate: submitOnboardingValues, isPending } = useMutation({
    mutationFn: setUserOnboardingValues,
    onSuccess: async () => {
      await refreshUserData();
      setIsComplete(true);
      setStep(5);
    },
    onError: (error) => {
      console.error("Error submitting onboarding data:", error);
      toast.error(t("errorSubmitting"));
      setIsOpen(false);
    },
  });

  const useGeolocation = watch("useGeolocation");
  const searchRadius = watch("searchRadius");
  const categories = watch("categories");
  const userType = watch("userType");

  const formSteps = 4;

  const handleGeolocationRequest = async () => {
    try {
      const coords = await getGeolocation();
      if (coords) {
        setValue("useGeolocation", true);
        setValue("geolocation", coords);
      }
      return coords;
    } catch (error) {
      console.error("Error getting geolocation:", error);
      setValue("useGeolocation", false);
      return null;
    }
  };

  const nextStep = async () => {
    if (step === 0) {
      setStep(1);
      return;
    }

    const isValid = await validateCurrentStep();

    if (isValid) {
      if (step < formSteps) {
        setStep(step + 1);
      } else {
        await completeOnboarding();
      }
    }
  };

  const previousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const validateCurrentStep = async () => {
    if (step === 0) return true;

    if (step === 1) {
      return await trigger(["firstName", "lastName", "displayName"]);
    } else if (step === 2) {
      if (useGeolocation) {
        return await trigger(["searchRadius"]);
      }
      return await trigger(["postalCode", "searchRadius"]);
    } else if (step === 3) {
      return await trigger(["categories"]);
    } else if (step === 4) {
      return await trigger(["userType"]);
    }
    return true;
  };

  const completeOnboarding = async () => {
    const values = getValues();

    submitOnboardingValues(values);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return {
    selectors: {
      isOpen,
      step,
      formSteps,
      isWelcomeStep: step === 0,
      isFormStep: step > 0 && step <= formSteps,
      isLastFormStep: step === formSteps,
      control,
      errors,
      isSubmitting: isSubmitting || isPending,
      isComplete,
      useGeolocation,
      searchRadius,
      categories,
      userType,
    },
    actions: {
      nextStep,
      previousStep,
      handleGeolocationRequest,
      handleCloseModal,
    },
  };
};
