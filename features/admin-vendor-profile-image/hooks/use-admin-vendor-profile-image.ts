import { updateProfileImage } from "@/actions/update-profile-image";
import { ModalRef } from "@/components/ui/modal";
import {
  AdminVendorProfileImageFormValues,
  createAdminVendorProfileImageFormSchema,
} from "@/features/admin-vendor-profile-image/utils/admin-vendor-profile-image-validation-schema";
import { cacheKeys } from "@/utils/cache-keys";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";

type UseAdminVendorProfileImageProps = {
  profileId: string;
  profileImageUrl: string | null;
};

export const useAdminVendorProfileImage = ({
  profileId,
  profileImageUrl,
}: UseAdminVendorProfileImageProps) => {
  const t = useTranslations("AdminVendorProfileImageForm");
  const modalRef = useRef<ModalRef>(null);
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminVendorProfileImageFormValues>({
    defaultValues: {
      imageUrl: profileImageUrl || "",
    },
    resolver: zodResolver(
      createAdminVendorProfileImageFormSchema()
    ) as Resolver<AdminVendorProfileImageFormValues>,
  });

  const { mutate: submitProfileImage, isPending } = useMutation({
    mutationFn: (data: AdminVendorProfileImageFormValues) => {
      return updateProfileImage({
        profileId: profileId,
        profileImage: data.imageUrl!,
      });
    },
    onSuccess: async () => {
      toast.success(t("success"));

      await queryClient.invalidateQueries({
        queryKey: cacheKeys.currentUserProfiles.list.queryKey,
      });

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
    submitProfileImage(data);
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
