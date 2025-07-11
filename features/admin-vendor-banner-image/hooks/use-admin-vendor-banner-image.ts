import { updateProfileBannerImage } from "@/actions/update-profile-banner-image";
import { ModalRef } from "@/components/ui/modal";
import {
  AdminVendorBannerImageFormValues,
  createAdminVendorBannerImageFormSchema,
} from "@/features/admin-vendor-banner-image/utils/admin-vendor-banner-image-validation-schema";
import { cacheKeys } from "@/utils/cache-keys";
import { useProfileInvalidator } from "@/utils/invalidators-hooks/use-profile-invalidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";

type UseAdminVendorBannerImageProps = {
  profileId: string;
  bannerImageUrl: string | null;
};

export const useAdminVendorBannerImage = ({
  profileId,
  bannerImageUrl,
}: UseAdminVendorBannerImageProps) => {
  const t = useTranslations("AdminVendorBannerImageForm");
  const modalRef = useRef<ModalRef>(null);
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminVendorBannerImageFormValues>({
    defaultValues: {
      imageUrl: bannerImageUrl || "",
    },
    resolver: zodResolver(
      createAdminVendorBannerImageFormSchema(t)
    ) as Resolver<AdminVendorBannerImageFormValues>,
  });
  const { invalidate: invalidateProfile } = useProfileInvalidator();

  const { mutate: submitBannerImage, isPending } = useMutation({
    mutationFn: (data: AdminVendorBannerImageFormValues) => {
      return updateProfileBannerImage({
        profileId: profileId,
        bannerImage: data.imageUrl!,
      });
    },
    onSuccess: async () => {
      toast.success(t("success"));

      await invalidateProfile({ profileId });

      reset({
        imageUrl: "",
      });

      modalRef.current?.close();
    },
    onError: () => {
      const message = t("error");
      toast.error(message);
    },
  });

  const onSubmit = handleSubmit((data) => {
    submitBannerImage(data);
  });

  const handleOpenModal = () => {
    modalRef.current?.open();
  };

  return {
    selectors: {
      modalRef,
      control,
      errors,
      isSubmitting: isPending,
    },
    actions: {
      handleFormSubmit: onSubmit,
      handleOpenModal,
    },
  };
};
