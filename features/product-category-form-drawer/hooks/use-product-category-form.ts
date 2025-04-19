import { useForm } from "react-hook-form";
import { ProductCategory } from "@/types/app";

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

  const onSubmit = (data: ProductCategoryFormValues) => {
    console.log(data);
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  return {
    selectors: { control, errors },
    actions: { handleFormSubmit },
  };
};
