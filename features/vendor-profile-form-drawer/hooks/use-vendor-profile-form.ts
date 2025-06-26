import { Locales } from "@/types/app";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  createVendorProfileFormSchema,
  VendorProfileFormValues,
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
    formState: { errors },
  } = useForm<VendorProfileFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema) as Resolver<VendorProfileFormValues>,
  });

  const name = watch("name");

  const { mutate: submitProfile, isPending } = useMutation({
    mutationFn: async (data: VendorProfileFormValues) => {
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
    onError: () => {
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
