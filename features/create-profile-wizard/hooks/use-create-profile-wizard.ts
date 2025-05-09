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

    // For the last step, we should submit the form
    if (currentIndex === steps.length - 1) {
      await handleFormSubmit();
      return;
    }

    // For other steps, validate the current step before moving to the next
    let isValid = true;

    // Validate fields based on the current step
    if (activeTab === "basic-info") {
      isValid = await trigger(["name", "slug", "name_translations", "slug_translations"]);
    } else if (activeTab === "details") {
      isValid = await trigger(["description", "description_translations"]);
    } else if (activeTab === "banner") {
      // Banner is optional, so we don't need to validate
      isValid = true;
    }

    if (isValid && currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1].id);
    }
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

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  // Auto-generate slug when name changes
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
      setActiveTab,
    },
  };
};
