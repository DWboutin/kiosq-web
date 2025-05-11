import { useForm, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  createProfileWizardSchema,
  VendorProfileFormValues,
} from "@/features/create-profile-wizard/utils/create-profile-wizard-schema";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { Locales } from "@/types/app";
import { slugify } from "@/utils/slugify";
import { SubmitHandler } from "react-hook-form";

export const useCreateProfileWizard = (steps: { id: string; label: string }[]) => {
  const t = useTranslations();
  const locale = useLocale() as Locales;
  const [activeTab, setActiveTab] = useState(steps[0].id);
  const vendorProfileSchema = createProfileWizardSchema(locale, t);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    trigger,
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      bannerImage: "",
      name_translations: {},
      description_translations: {},
      slug_translations: {},
    },
  });
  const formValues = getValues();
  const name = watch("name");
  const name_translations = watch("name_translations");

  const handleNext = async () => {
    const currentIndex = steps.findIndex((step) => step.id === activeTab);

    if (currentIndex === steps.length - 1) {
      await handleFormSubmit();
      return;
    }

    const isValid = await validateStep(activeTab);

    if (isValid && currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1].id);
    }
  };

  const validateStep = async (stepId: string): Promise<boolean> => {
    if (stepId === "basic-info") {
      return await trigger(["name", "slug", "name_translations", "slug_translations"]);
    } else if (stepId === "details") {
      return await trigger(["description", "description_translations"]);
    } else if (stepId === "banner") {
      return true;
    }

    return true;
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex((step) => step.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(steps[currentIndex - 1].id);
    }
  };

  const onSubmit: SubmitHandler<VendorProfileFormValues> = async (data) => {
    try {
      // This is a mock implementation
      console.log("Form data submitted:", data);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation, this would call an API or server action
      // to create the vendor profile in the database

      // Show success alert or redirect user
      alert("Vendor profile created successfully!");

      return { success: true, data };
    } catch (error) {
      console.error("Error submitting form:", error);
      return { success: false, error };
    }
  };

  const handleFormSubmit = handleSubmit(
    onSubmit as unknown as SubmitHandler<VendorProfileFormValues>
  );

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  const autoGenerateSlug = () => {
    const name = watch("name");
    return generateSlug(name);
  };

  const isLastStep = activeTab === steps[steps.length - 1].id;
  const isFirstStep = activeTab === steps[0].id;

  useEffect(() => {
    if (name) {
      setValue("slug", slugify(name));
    }
  }, [name]);

  useEffect(() => {
    if (name_translations) {
      setValue(
        "slug_translations",
        Object.keys(name_translations).reduce((acc, key) => {
          acc[key] = slugify(name_translations[key]);
          return acc;
        }, {} as Record<string, string>)
      );
    }
  }, [name_translations]);

  const handleChangeTab = async (tab: string) => {
    const currentTabIndex = steps.findIndex((step) => step.id === activeTab);
    const targetTabIndex = steps.findIndex((step) => step.id === tab);

    if (targetTabIndex < currentTabIndex) {
      setActiveTab(tab);
      return;
    }

    let i = currentTabIndex;

    while (i < targetTabIndex) {
      const isStepValid = await validateStep(steps[i].id);

      if (!isStepValid) return;

      i++;
    }

    setActiveTab(tab);
  };

  return {
    selectors: {
      control: control as Control<VendorProfileFormValues>,
      errors,
      isSubmitting,
      watch,
      activeTab,
      formValues: formValues as VendorProfileFormValues,
      isLastStep,
      isFirstStep,
    },
    actions: {
      handleFormSubmit,
      autoGenerateSlug,
      trigger,
      getValues,
      handleNext,
      handlePrevious,
      handleChangeTab,
    },
  };
};
