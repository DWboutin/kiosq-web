import { Locales } from "@/types/app";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  createProductFormSchema,
  ProductFormValues,
} from "@/features/product-form-drawer/utils/product-form-validation-schema";

export const useProductForm = () => {
  const t = useTranslations();
  const locale = useLocale() as Locales;
  const validationSchema = createProductFormSchema(locale, t);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
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

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  const addChecklistItem = () => {
    if (fields.length < 5) {
      append({ value: "", value_translations: {} });
    }
  };

  return {
    selectors: { control, errors, fields, categoryValue },
    actions: { handleFormSubmit: onSubmit, addChecklistItem, remove },
  };
};
