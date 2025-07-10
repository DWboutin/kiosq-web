import { Control, FieldErrors, useForm } from "react-hook-form";
import { Locales } from "@/types/app";
import { useLocale, useTranslations } from "next-intl";
import { addProductCategory } from "@/actions/add-product-category";
import { SideFormDrawerRef } from "@/components/ui/side-form-drawer";
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
import { useCategoriesInvalidator } from "@/utils/invalidators-hooks/use-categories-invalidator";

export type ProductCategoryFormValues = z.infer<ReturnType<typeof createProductCategorySchema>>;

type ProductCategoryFormActions = {
  handleFormSubmit: () => void;
};

type ProductCategoryFormSelectors = {
  control: Control<ProductCategoryFormValues>;
  errors: FieldErrors<ProductCategoryFormValues>;
  isUpdating: boolean;
  hasErrors: boolean;
};

type ProductCategoryFormHook = {
  selectors: ProductCategoryFormSelectors;
  actions: ProductCategoryFormActions;
};

export const useProductCategoryForm = (
  sideDrawerRef: RefObject<SideFormDrawerRef>
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
  const { revalidate: revalidateCategories } = useCategoriesInvalidator();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
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
      await revalidateCategories();
      sideDrawerRef?.current?.close();
      reset();
      resetCategory();
      toast.success(t("CategoriesTable.categoryAdded"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("Slug")) {
        // Extract language information if available
        const languageMatch = error.message.match(/language "([^"]+)"/);
        const language = languageMatch ? languageMatch[1] : null;

        if (language && language !== locale) {
          // If the error is for a translation
          const translationKey = `slug_translations.${language}`;
          setError(translationKey as `slug_translations.${string}`, {
            message: t("CategoriesTable.slugExists"),
          });
        } else {
          // Default case: set error on the main slug field
          setError("slug", { message: t("CategoriesTable.slugExists") });
        }
      } else {
        console.error(error);
        toast.error(t("CategoriesTable.categoryAddError"));
      }
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
    if (name_translations) {
      setValue(
        "slug_translations",
        Object.keys(name_translations).reduce((acc, key) => {
          acc[key] = slugify(name_translations[key]);
          return acc;
        }, {} as Record<string, string>)
      );
    }
  }, [name_translations]);

  return {
    selectors: {
      control: control as Control<ProductCategoryFormValues>,
      errors,
      hasErrors: errors ? Object.keys(errors).length > 0 : false,
      isUpdating: !!selectedId,
    },
    actions: { handleFormSubmit: onSubmit },
  };
};
