import { Locales } from "@/types/app";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  createProductFormSchema,
  ProductFormValues,
} from "@/features/product-form-drawer/utils/product-form-validation-schema";
import { useMutation } from "@tanstack/react-query";
import { createProduct } from "@/actions/create-product";

export const useProductForm = () => {
  const t = useTranslations();
  const locale = useLocale() as Locales;
  const validationSchema = createProductFormSchema(locale, t);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      name_translations: {},
      description: "",
      description_translations: {},
      category: "",
      subcategory: "",
      price: "",
      quantity: "",
      unit: "",
      checklist: [],
    },
    resolver: zodResolver(validationSchema) as Resolver<ProductFormValues>,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "checklist",
  });

  const categoryValue = watch("category");

  const { mutate: submitProduct, isPending } = useMutation({
    mutationFn: (data: ProductFormValues) => createProduct({ ...data, locale }),
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit = handleSubmit((data) => {
    submitProduct(data);
  });

  const addChecklistItem = () => {
    if (fields.length < 5) {
      append({ value: "", value_translations: {} });
    }
  };

  return {
    selectors: { control, errors, fields, categoryValue, isSubmitting: isPending },
    actions: { handleFormSubmit: onSubmit, addChecklistItem, remove },
  };
};
