import { Locales } from "@/types/app";
import { Resolver, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  createProductFormSchema,
  ProductFormValues,
} from "@/features/product-form-drawer/utils/product-form-validation-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/actions/create-product";
import { toast } from "sonner";
import { useCurrentUserProductById } from "@/hooks/use-current-user-product-by-id";
import { updateProduct } from "@/actions/update-product";
import { cacheKeys } from "@/utils/cache-keys";
import { SideFormDrawerRef } from "@/components/ui/side-form-drawer";
import { useRef } from "react";
import { AuthenticatedUserProductWithVariantsAndPrices } from "@/utils/factories/authenticated-user-product-factory";
import { filterTranslations } from "@/utils/filter-translations";
import { useProductsInvalidator } from "@/utils/invalidators-hooks/use-products-invalidator";

type UseProductFormProps = {
  editMode?: boolean;
  productId?: string;
};

const productDefaultValues: ProductFormValues = {
  name: "",
  name_translations: {},
  description: "",
  description_translations: {},
  category: "",
  subcategory: "",
  checklist: [],
  price: "",
  quantity: "",
  unit: "",
};

const fillProductFormValues = (
  product: AuthenticatedUserProductWithVariantsAndPrices,
  locale: Locales
) => {
  const filteredNameTranslations = filterTranslations(product?.nameTranslations, locale);
  const filteredDescriptionTranslations = filterTranslations(
    product?.descriptionTranslations,
    locale
  );

  return {
    ...productDefaultValues,
    name: product?.nameTranslations[locale],
    name_translations: filteredNameTranslations,
    description: product?.descriptionTranslations[locale],
    description_translations: filteredDescriptionTranslations,
    category:
      product?.category.parentCategory === null
        ? product?.category.id
        : product?.category.parentCategory?.id,
    subcategory: product?.category.parentCategory !== null ? product?.category.id : "",
    checklist:
      product?.checklistTranslations?.map((item) => ({
        value: typeof item === "string" ? item : item[locale] || "",
        value_translations: typeof item === "object" ? item : { [locale]: item },
      })) || [],
  };
};

export const useProductForm = ({ editMode = false, productId }: UseProductFormProps = {}) => {
  const t = useTranslations();
  const drawerRef = useRef<SideFormDrawerRef>(null);
  const locale = useLocale() as Locales;
  const queryClient = useQueryClient();
  const validationSchema = createProductFormSchema(locale, t, editMode);
  const {
    selectors: { product },
    actions: { refetch },
  } = useCurrentUserProductById({ productId });
  const { revalidate: revalidateProducts } = useProductsInvalidator();

  const defaultValues: ProductFormValues = !product
    ? productDefaultValues
    : fillProductFormValues(product, locale);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    defaultValues,
    resolver: zodResolver(validationSchema) as Resolver<ProductFormValues>,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "checklist",
  });

  const categoryValue = watch("category");
  const name = watch("name");

  const { mutate: submitProduct, isPending } = useMutation({
    mutationFn: (data: ProductFormValues) =>
      editMode
        ? updateProduct({ ...data, locale, id: productId! })
        : createProduct({ ...data, locale }),
    onSuccess: async (savedProduct) => {
      const message = editMode
        ? t("ProductForm.updated", { name })
        : t("ProductForm.created", { name });

      toast.success(message);

      await revalidateProducts({ productId: savedProduct.id, profileId: savedProduct.profile_id });

      if (editMode) {
        refetch();
        drawerRef.current?.close();
      } else {
        reset();
      }
    },
    onError: () => {
      const message = editMode ? t("ProductForm.updatedError") : t("ProductForm.createdError");

      toast.error(message);
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
    selectors: { control, errors, fields, categoryValue, isSubmitting: isPending, drawerRef },
    actions: { handleFormSubmit: onSubmit, addChecklistItem, remove },
  };
};
