import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { UserOnboardingValues } from "../schemas/user-onboarding-schema";
import { getGeolocation } from "@/utils/get-geolocation";
import { useUserStore } from "@/stores/user-store";

export const useUserOnboarding = () => {
  const [step, setStep] = useState(3);
  const [isComplete, setIsComplete] = useState(false);
  const refreshUserData = useUserStore((state) => state.refreshUserData);

  const {
    control,
    formState: { errors, isSubmitting },
    setValue,
    trigger,
    getValues,
    register,
  } = useForm<UserOnboardingValues>({
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      postalCode: "",
      useGeolocation: false,
      searchRadius: 100,
      categories: [],
      userType: "User",
    },
  });

  // Watch relevant fields for UI
  const useGeolocation = useWatch({ control, name: "useGeolocation" });
  const searchRadius = useWatch({ control, name: "searchRadius" });
  const categories = useWatch({ control, name: "categories" });
  const userType = useWatch({ control, name: "userType" });

  // Register fields with validation
  useEffect(() => {
    register("firstName", { required: "First name is required" });
    register("lastName", { required: "Last name is required" });
    register("displayName", { required: "Display name is required" });
    register("postalCode", {
      required: !useGeolocation ? "Postal code is required when geolocation is disabled" : false,
    });
    register("categories", {
      validate: (value) => value?.length === 3 || "Please select exactly 3 categories",
    });
    register("userType", { required: "User type is required" });
  }, []); // Only run once on mount

  // Actual form steps (excluding welcome step)
  const formSteps = 4;

  const handleGeolocationRequest = async () => {
    try {
      const coords = await getGeolocation();
      if (coords) {
        setValue("useGeolocation", true);
      }
      return coords;
    } catch (error) {
      console.error("Error getting geolocation:", error);
      setValue("useGeolocation", false);
      return null;
    }
  };

  const nextStep = async () => {
    // Skip validation for welcome step (step 0)
    if (step === 0) {
      setStep(1);
      return;
    }

    const isValid = await validateCurrentStep();
    console.log("Validation result:", isValid, errors);

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
    // Welcome step doesn't need validation
    if (step === 0) return true;

    if (step === 1) {
      return await trigger(["firstName", "lastName", "displayName"]);
    } else if (step === 2) {
      // If geolocation is enabled, only validate searchRadius
      if (useGeolocation) {
        return await trigger(["searchRadius"]);
      }
      // Otherwise validate both fields
      return await trigger(["postalCode", "searchRadius"]);
    } else if (step === 3) {
      return await trigger(["categories"]);
    } else if (step === 4) {
      return await trigger(["userType"]);
    }
    return true;
  };

  const completeOnboarding = async () => {
    // Here we would send the collected data to the backend
    // For now, we'll just mark the onboarding as complete locally
    console.log("Onboarding data:", getValues());
    await refreshUserData();
    setIsComplete(true);
  };

  return {
    selectors: {
      step,
      formSteps,
      isWelcomeStep: step === 0,
      isFormStep: step > 0 && step <= formSteps,
      isLastFormStep: step === formSteps,
      control,
      errors,
      isSubmitting,
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
    },
  };
};
