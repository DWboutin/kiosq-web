import { useForm } from "react-hook-form";
import { Locales, ProductCategory } from "@/types/app";
import { useLocale } from "next-intl";
import { addProductCategory } from "@/actions/add-product-category";
import { SideDrawerRef } from "@/components/ui/side-drawer";
import { useEffect, RefObject } from "react";
import { useCategoriesStore } from "@/stores/categories-store";
import { usePrevious } from "@/utils/hooks/use-previous";
import { LOCALES } from "@/utils/constants";

export type ProductCategoryFormValues = Omit<
  ProductCategory,
  | "id"
  | "created_at"
  | "updated_at"
  | "updated_by"
  | "is_deleted"
  | "is_active"
  | "slug"
  | "name_translations"
  | "description_translations"
  | "image_url"
  | "order_rank"
  | "parent_id"
> & {
  name: string;
  description: string;
  slug: string;
  parentId: string;
  orderRank: number;
  name_translations: {
    [key: string]: string;
  };
  description_translations: {
    [key: string]: string;
  };
  slug_translations: {
    [key: string]: string;
  };
};

export const useProductCategoryForm = (sideDrawerRef: RefObject<SideDrawerRef>) => {
  const locale = useLocale() as Locales;
  const initialData = useCategoriesStore((state) => state.initialData);
  const selectedId = useCategoriesStore((state) => state.selectedId);
  const resetInitialData = useCategoriesStore((state) => state.resetInitialData);
  const isDrawerOpen = sideDrawerRef?.current?.isOpen;
  const previousIsDrawerOpen = usePrevious(isDrawerOpen);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductCategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      parentId: "",
      orderRank: 0,
      name_translations: {},
      description_translations: {},
      slug_translations: {},
    },
  });

  const onSubmit = async (data: ProductCategoryFormValues) => {
    try {
      console.log(data);
      await addProductCategory({
        ...data,
        locale,
      });
      sideDrawerRef?.current?.close();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  useEffect(() => {
    if (initialData) {
      const otherLocales = LOCALES.filter((key) => key !== locale);
      const nameTranslations = otherLocales.reduce((acc, key) => {
        acc[key] = initialData.name[key];
        return acc;
      }, {} as Record<string, string>);
      const descriptionTranslations = otherLocales.reduce((acc, key) => {
        acc[key] = initialData.description[key];
        return acc;
      }, {} as Record<string, string>);
      const slugTranslations = otherLocales.reduce((acc, key) => {
        acc[key] = initialData.slug[key];
        return acc;
      }, {} as Record<string, string>);

      reset({
        name: initialData.name[locale],
        description: initialData.description[locale],
        slug: initialData.slug[locale],
        parentId: initialData.parentId || "",
        orderRank: initialData.orderRank || 0,
        name_translations: nameTranslations,
        description_translations: descriptionTranslations,
        slug_translations: slugTranslations,
      });
    }
  }, [initialData, reset, locale]);

  useEffect(() => {
    if (!isDrawerOpen && previousIsDrawerOpen) {
      reset({
        name: "",
        description: "",
        slug: "",
        parentId: "",
        orderRank: 0,
        name_translations: {},
        description_translations: {},
        slug_translations: {},
      });

      resetInitialData();
    }
  }, [isDrawerOpen, previousIsDrawerOpen, reset, resetInitialData]);

  useEffect(() => {
    if (initialData && !isDrawerOpen) {
      sideDrawerRef?.current?.open();
    }
  }, [initialData, selectedId, isDrawerOpen, sideDrawerRef]);

  return {
    selectors: { control, errors },
    actions: { handleFormSubmit },
  };
};
