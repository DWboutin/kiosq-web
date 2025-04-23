import { useFieldArray, useForm } from "react-hook-form";

type ChecklistItem = { value: string };

export type ProductFormValues = {
  name: string;
  description: string;
  category: string;
  price: string;
  quantity: string;
  unit: string;
  checklist: ChecklistItem[];
};

export const useProductForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      quantity: "",
      unit: "",
      checklist: [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "checklist",
  });

  const onSubmit = (data: ProductFormValues) => {
    console.log(data);
  };

  const addChecklistItem = () => {
    if (fields.length < 5) {
      append({ value: "" });
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  return {
    selectors: { control, errors, fields },
    actions: { handleFormSubmit, addChecklistItem, remove },
  };
};
