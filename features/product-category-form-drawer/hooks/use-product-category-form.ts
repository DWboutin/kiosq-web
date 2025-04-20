import { useForm } from "react-hook-form";
import { Locales, ProductCategory } from "@/types/app";
import { useLocale } from "next-intl";
import { addProductCategory } from "@/actions/add-product-category";
import { SideDrawerRef } from "@/components/ui/side-drawer";
import { useEffect, RefObject } from "react";
import { useCategoriesStore } from "@/stores/categories-store";
import { usePrevious } from "@/utils/hooks/use-previous";
import { updateProductCategory } from "@/actions/update-product-category";
import { extractTranslations } from "@/utils/extract-translations";

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
  const lastSelected = useCategoriesStore((state) => state.lastSelected);
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
      parentId: "false",
      orderRank: 0,
      name_translations: {},
      description_translations: {},
      slug_translations: {},
    },
  });

  const onSubmit = async (data: ProductCategoryFormValues) => {
    try {
      if (selectedId) {
        await updateProductCategory({
          ...data,
          locale,
          id: selectedId,
        });
      } else {
        await addProductCategory({
          ...data,
          locale,
        });
      }
      sideDrawerRef?.current?.close();
      reset();
      resetInitialData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  useEffect(() => {
    if (initialData) {
      const excludeLocale = [locale];
      const nameTranslations = extractTranslations(initialData, "name", excludeLocale);
      const descriptionTranslations = extractTranslations(
        initialData,
        "description",
        excludeLocale
      );
      const slugTranslations = extractTranslations(initialData, "slug", excludeLocale);

      reset({
        name: initialData.name[locale],
        description: initialData.description[locale],
        slug: initialData.slug[locale],
        parentId: initialData.parentId || "false",
        orderRank: initialData.orderRank || 0,
        name_translations: nameTranslations,
        description_translations: descriptionTranslations,
        slug_translations: slugTranslations,
      });
    }
  }, [initialData, lastSelected, reset, locale]);

  useEffect(() => {
    if (!isDrawerOpen && previousIsDrawerOpen) {
      reset({
        name: "",
        description: "",
        slug: "",
        parentId: "false",
        orderRank: 0,
        name_translations: {},
        description_translations: {},
        slug_translations: {},
      });
    }
  }, [isDrawerOpen, previousIsDrawerOpen, reset]);

  useEffect(() => {
    if (initialData && !isDrawerOpen) {
      sideDrawerRef?.current?.open();
    }
  }, [initialData, lastSelected, isDrawerOpen, sideDrawerRef]);

  return {
    selectors: { control, errors, isUpdating: !!selectedId },
    actions: { handleFormSubmit },
  };
};
