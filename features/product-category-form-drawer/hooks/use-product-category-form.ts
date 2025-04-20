import { useForm } from "react-hook-form";
import { ProductCategory } from "@/types/app";
import { useLocale } from "next-intl";
import { addProductCategory } from "@/actions/add-product-category";

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
};

export const useProductCategoryForm = () => {
  const locale = useLocale();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductCategoryFormValues>({
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      parentId: "",
      orderRank: 0,
    },
  });

  const onSubmit = async (data: ProductCategoryFormValues) => {
    try {
      await addProductCategory({
        ...data,
        locale,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  return {
    selectors: { control, errors },
    actions: { handleFormSubmit },
  };
};
