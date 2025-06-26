import { Locales } from "@/types/app";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  createVendorProfileFormSchema,
  VendorProfileFormValues,
  checkSlugAvailability,
} from "@/features/vendor-profile-form-drawer/utils/vendor-profile-validation-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SideFormDrawerRef } from "@/components/ui/side-form-drawer";
import { useEffect, useRef } from "react";
import { useCurrentUserProfiles } from "@/hooks/use-current-user-profiles";
import { updateVendorProfile } from "@/actions/update-vendor-profile";
import { Profile } from "@/utils/factories/profiles-factory";

type UseVendorProfileFormProps = {
  profileId: string;
};

const getVendorProfileDefaultValues = (
  profile: Profile | undefined,
  locale: Locales
): VendorProfileFormValues => {
  if (!profile) {
    return {
      name: "",
      name_translations: {},
      description: "",
      description_translations: {},
      slug: "",
      slug_translations: {},
    };
  }

  return {
    name: profile.nameTranslations?.[locale] || "",
    name_translations: profile.nameTranslations || {},
    description: profile.descriptionTranslations?.[locale] || "",
    description_translations: profile.descriptionTranslations || {},
    slug: profile.slugTranslations?.[locale] || "",
    slug_translations: profile.slugTranslations || {},
  };
};

export const useVendorProfileForm = ({ profileId }: UseVendorProfileFormProps) => {
  const t = useTranslations();
  const drawerRef = useRef<SideFormDrawerRef>(null);
  const locale = useLocale() as Locales;
  const queryClient = useQueryClient();
  const validationSchema = createVendorProfileFormSchema(locale, t);

  const {
    selectors: { profiles },
  } = useCurrentUserProfiles();

  const vendorProfile = profiles?.find((p) => p.id === profileId && p.type === "vendor");
  const defaultValues = getVendorProfileDefaultValues(vendorProfile, locale);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<VendorProfileFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema) as Resolver<VendorProfileFormValues>,
  });

  const name = watch("name");

  const validateSlugUniqueness = async (data: VendorProfileFormValues) => {
    // Clear previous slug errors
    clearErrors("slug");
    clearErrors("slug_translations");

    // Check main slug
    const mainSlugAvailable = await checkSlugAvailability(data.slug, profileId, locale);
    if (!mainSlugAvailable) {
      setError("slug", {
        type: "manual",
        message: t("VendorProfileForm.validationSlugAlreadyTaken"),
      });
      return false;
    }

    // Check translated slugs
    for (const [lang, slug] of Object.entries(data.slug_translations)) {
      if (slug) {
        const slugAvailable = await checkSlugAvailability(slug, profileId, lang);
        if (!slugAvailable) {
          setError("slug_translations", {
            type: "manual",
            message: t("VendorProfileForm.validationSlugTranslationAlreadyTaken"),
          });
          return false;
        }
      }
    }

    return true;
  };

  const { mutate: submitProfile, isPending } = useMutation({
    mutationFn: async (data: VendorProfileFormValues) => {
      // Validate slug uniqueness before submitting
      const isSlugValid = await validateSlugUniqueness(data);
      if (!isSlugValid) {
        throw new Error("Slug validation failed");
      }

      return updateVendorProfile({ ...data, profileId, locale });
    },
    onSuccess: async () => {
      const message = t("VendorProfileForm.updated", { name });
      toast.success(message);

      // Invalidate and refetch profiles
      await queryClient.invalidateQueries({
        queryKey: ["currentUserProfiles"],
      });

      drawerRef.current?.close();
    },
    onError: (error: Error) => {
      if (error.message === "Slug validation failed") {
        // Slug validation error is already handled by setError above
        return;
      }
      if (error.message === "SLUG_NOT_UNIQUE") {
        // Handle database constraint violation as fallback
        setError("slug", {
          type: "manual",
          message: t("VendorProfileForm.validationSlugAlreadyTaken"),
        });
        return;
      }
      const message = t("VendorProfileForm.updatedError");
      toast.error(message);
    },
  });

  const onSubmit = handleSubmit((data) => {
    submitProfile(data);
  });

  useEffect(() => {
    reset(defaultValues);
  }, [vendorProfile]);

  return {
    selectors: { control, errors, isSubmitting: isPending, drawerRef },
    actions: { handleFormSubmit: onSubmit },
  };
};
