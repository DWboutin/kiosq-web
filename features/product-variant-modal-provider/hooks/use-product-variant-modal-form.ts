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
import { createProductVariant } from "@/actions/create-product-variant";
import { useParams } from "next/navigation";
import { productRevalidator } from "@/actions/revalidators/product-revalidator";
import { useProductsInvalidator } from "@/utils/invalidators-hooks/use-products-invalidator";

type UseProductVariantModalFormProps = {
  onSuccess?: () => void;
};

const formDefaultValues: ProductVariantFormValues = {
  id: "",
  quantity: 0,
  unit: "",
  price: 0,
  imageUrl: "",
  isDefault: false,
};

export const useProductVariantModalForm = ({ onSuccess }: UseProductVariantModalFormProps = {}) => {
  const t = useTranslations();
  const validationSchema = createProductVariantFormSchema(t);
  const { variantValues } = useProductVariantModalContext();
  const params = useParams();
  const productId = params.productId as string;
  const { invalidate: invalidateProducts } = useProductsInvalidator();

  const defaultValues: ProductVariantFormValues = variantValues?.id
    ? {
        id: variantValues?.id || "",
        quantity: variantValues?.quantity || 0,
        unit: variantValues?.unit || "",
        price: variantValues?.price || 0,
        imageUrl: variantValues?.imageUrl || "",
        isDefault: variantValues?.isDefault || false,
      }
    : formDefaultValues;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProductVariantFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema) as Resolver<ProductVariantFormValues>,
  });

  const quantity = watch("quantity");
  const unit = watch("unit");

  const { mutate: submitVariant, isPending } = useMutation({
    mutationFn: (data: ProductVariantFormValues) => {
      if (!variantValues?.id) {
        return createProductVariant({
          productId: productId,
          quantity: data.quantity,
          unit: data.unit,
          price: data.price,
          imageUrl: data.imageUrl,
          isDefault: data.isDefault,
        });
      }

      return updateProductVariant({
        id: variantValues.id,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        imageUrl: data.imageUrl,
        isDefault: data.isDefault,
      });
    },
    onSuccess: async () => {
      const variantTitle = `${quantity} ${unit}`;
      const message = t("ProductVariantForm.updated", { variant: variantTitle });

      toast.success(message);

      invalidateProducts({ productId });

      reset(formDefaultValues);

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

  useEffect(() => {
    reset(variantValues || formDefaultValues);
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
      reset,
    },
  };
};
