import { Control, FieldErrors, useForm } from "react-hook-form";
import { Locales } from "@/types/app";
import { useLocale, useTranslations } from "next-intl";
import { addProductCategory } from "@/actions/add-product-category";
import { SideDrawerRef } from "@/components/ui/side-drawer";
import { useEffect, RefObject, useState } from "react";
import { useCategoriesStore } from "@/stores/categories-store";
import { usePrevious } from "@/utils/hooks/use-previous";
import { updateProductCategory } from "@/actions/update-product-category";
import { extractTranslations } from "@/utils/extract-translations";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductCategorySchema } from "@/features/product-category-form-drawer/utils/product-category-validation-schema";
import { slugify } from "@/utils/slugify";
import { toast } from "sonner";

export type ProductCategoryFormValues = z.infer<ReturnType<typeof createProductCategorySchema>>;

type ProductCategoryFormActions = {
  handleFormSubmit: () => void;
};

type ProductCategoryFormSelectors = {
  control: Control<ProductCategoryFormValues>;
  errors: FieldErrors<ProductCategoryFormValues>;
  isUpdating: boolean;
};
type ProductCategoryFormHook = {
  selectors: ProductCategoryFormSelectors;
  actions: ProductCategoryFormActions;
};

export const useProductCategoryForm = (
  sideDrawerRef: RefObject<SideDrawerRef>
): ProductCategoryFormHook => {
  const t = useTranslations();
  const locale = useLocale() as Locales;
  const initialData = useCategoriesStore((state) => state.initialData);
  const selectedId = useCategoriesStore((state) => state.selectedId);
  const resetCategory = useCategoriesStore((state) => state.resetCategory);
  const lastSelected = useCategoriesStore((state) => state.lastSelected);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const previousDrawerOpen = usePrevious(drawerOpen);
  const validationSchema = createProductCategorySchema(locale, t);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      parentId: "false",
      orderRank: "0",
      name_translations: {},
      description_translations: {},
      slug_translations: {},
    },
    resolver: zodResolver(validationSchema),
  });
  const name = watch("name");
  const name_translations = watch("name_translations");
  const slug_translations = watch("slug_translations");

  const onSubmit = handleSubmit(async (data) => {
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
      resetCategory();
      toast.success(t("CategoriesTable.categoryAdded"));
    } catch (error) {
      console.error(error);
      toast.error(t("CategoriesTable.categoryAddError"));
    }
  });

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
        orderRank: String(initialData.orderRank || 0),
        name_translations: nameTranslations,
        description_translations: descriptionTranslations,
        slug_translations: slugTranslations,
      });
    }
  }, [initialData, lastSelected, reset, locale]);

  useEffect(() => {
    const checkDrawerState = () => {
      const isOpen = sideDrawerRef?.current?.isOpen || false;
      if (isOpen !== drawerOpen) {
        setDrawerOpen(isOpen);
      }
    };

    checkDrawerState();

    const intervalId = setInterval(checkDrawerState, 100);

    return () => clearInterval(intervalId);
  }, [sideDrawerRef, drawerOpen]);

  useEffect(() => {
    if (!drawerOpen && previousDrawerOpen) {
      reset({
        name: "",
        description: "",
        slug: "",
        parentId: "false",
        orderRank: "0",
        name_translations: {},
        description_translations: {},
        slug_translations: {},
      });
      resetCategory();
    }
  }, [drawerOpen, previousDrawerOpen, reset, resetCategory]);

  useEffect(() => {
    if (initialData && !drawerOpen) {
      sideDrawerRef?.current?.open();
    }
  }, [initialData]);

  useEffect(() => {
    if (name) {
      setValue("slug", slugify(name));
    }
  }, [name]);

  useEffect(() => {
    if (name_translations && Object.keys(name_translations).length > 0) {
      const updatedSlugs = Object.keys(name_translations).reduce<Record<string, string>>(
        (acc, nameLocale) => ({
          ...acc,
          [nameLocale]: slugify(name_translations[nameLocale]),
        }),
        {}
      );

      setValue("slug_translations", {
        ...(slug_translations || {}),
        ...updatedSlugs,
      });
    }
  }, [name_translations]);

  return {
    selectors: {
      control: control as Control<ProductCategoryFormValues>,
      errors,
      isUpdating: !!selectedId,
    },
    actions: { handleFormSubmit: onSubmit },
  };
};
