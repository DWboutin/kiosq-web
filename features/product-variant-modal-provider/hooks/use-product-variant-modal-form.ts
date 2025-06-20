import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createProductVariantFormSchema,
  ProductVariantFormValues,
} from "@/features/product-variant-modal-provider/utils/product-variant-validation-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductVariant } from "@/actions/update-product-variant";
import { toast } from "sonner";
import { cacheKeys } from "@/utils/cache-keys";
import { useProductVariantModalContext } from "@/features/product-variant-modal-provider/product-variant-modal-provider";
import { useEffect } from "react";

type UseProductVariantModalFormProps = {
  onSuccess?: () => void;
};

export const useProductVariantModalForm = ({ onSuccess }: UseProductVariantModalFormProps = {}) => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const validationSchema = createProductVariantFormSchema(t);
  const { variantValues } = useProductVariantModalContext();

  const defaultValues: ProductVariantFormValues = {
    id: variantValues?.id || "",
    quantity: variantValues?.quantity || 0,
    unit: variantValues?.unit || "",
    price: variantValues?.price || 0,
    imageUrl: variantValues?.imageUrl || "",
    isDefault: variantValues?.isDefault || false,
  };

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm<ProductVariantFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema) as Resolver<ProductVariantFormValues>,
  });

  const quantity = watch("quantity");
  const unit = watch("unit");

  const { mutate: submitVariant, isPending } = useMutation({
    mutationFn: (data: ProductVariantFormValues) =>
      updateProductVariant({
        id: data.id,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        imageUrl: data.imageUrl,
        isDefault: data.isDefault,
      }),
    onSuccess: async (result) => {
      const variantTitle = `${quantity} ${unit}`;
      const message = t("ProductVariantForm.updated", { variant: variantTitle });

      toast.success(message);

      // Invalidate the product cache to refresh the variant data
      await queryClient.invalidateQueries({
        queryKey: cacheKeys.currentUserProductById(result.product_id).queryKey,
      });

      onSuccess?.();
    },
    onError: () => {
      const message = t("ProductVariantForm.updatedError");
      toast.error(message);
    },
  });

  const onSubmit = handleSubmit((data) => {
    submitVariant(data);
  });

  // Handle image file upload and conversion to base64
  const handleImageUpload = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setValue("imageUrl", base64);
      return base64;
    } catch (error) {
      console.error("Error converting image to base64:", error);
      toast.error(t("ProductVariantForm.imageUploadError"));
      return null;
    }
  };

  // Convert a file to base64 string
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    if (variantValues) {
      reset(variantValues);
    }
  }, [variantValues]);

  return {
    selectors: {
      control,
      errors,
      isSubmitting: isPending,
      formValues: { quantity, unit },
    },
    actions: {
      handleFormSubmit: onSubmit,
      handleImageUpload,
      reset,
    },
  };
};
