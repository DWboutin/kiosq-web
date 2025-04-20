import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { FieldErrors, Control } from "react-hook-form";
import { FC } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ProductCategoryFormValues } from "@/features/product-category-form-drawer/hooks/use-product-category-form";
import { ControlledSelect } from "@/components/ui/form-utils/controlled-select";
import { AddTranslationField } from "@/components/ui/form-utils/add-translaction-field";

type ProductCategoryFormProps = {
  control: Control<ProductCategoryFormValues>;
  errors: FieldErrors<ProductCategoryFormValues>;
};

export const ProductCategoryForm: FC<ProductCategoryFormProps> = ({ control, errors }) => {
  return (
    <>
      <FormInputContainer
        inputId="name"
        label="Nom du produit"
        error={errors.name?.message}
        required
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="name"
              placeholder="Fraise des champs"
              aria-invalid={!!errors.name}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField name="name" control={control} />
      <FormInputContainer
        inputId="description"
        label="Description"
        error={errors.description?.message}
        required
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              id="description"
              placeholder="Mon produit est un..."
              aria-invalid={!!errors.description}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField name="description" control={control} fieldType="textarea" />
      <FormInputContainer inputId="slug" label="Slug" error={errors.slug?.message} required>
        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <Input
              id="slug"
              placeholder="fraise-des-champs"
              aria-invalid={!!errors.slug}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField name="slug" control={control} />
      <FormInputContainer
        inputId="parentId"
        label="Parent"
        error={errors.parentId?.message}
        required
      >
        <Controller
          name="parentId"
          control={control}
          render={({ field }) => (
            <ControlledSelect
              id="parentId"
              placeholder="Parent category"
              aria-invalid={!!errors.parentId}
              {...field}
              options={[
                {
                  label: "No parent category",
                  value: "false",
                },
              ]}
            />
          )}
        />
      </FormInputContainer>
      <FormInputContainer
        inputId="orderRank"
        label="Order rank"
        error={errors.orderRank?.message}
        required
      >
        <Controller
          name="orderRank"
          control={control}
          render={({ field }) => (
            <Input
              id="orderRank"
              type="number"
              placeholder="1"
              aria-invalid={!!errors.orderRank}
              {...field}
            />
          )}
        />
      </FormInputContainer>
    </>
  );
};
