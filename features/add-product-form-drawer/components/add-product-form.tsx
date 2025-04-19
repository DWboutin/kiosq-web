import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { UnitDropdown } from "@/components/ui/form-utils/unit-dropdown";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { ProductFormValues } from "@/features/add-product-form-drawer/hooks/use-add-product-form";
import { FieldErrors, Control } from "react-hook-form";
import { FC } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ControlledSelect } from "@/components/ui/form-utils/controlled-select";
import { CATEGORIES_ORDER } from "@/utils/constants";

type AddProductFormProps = {
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
};

export const AddProductForm: FC<AddProductFormProps> = ({ control, errors }) => {
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
      <FormInputContainer
        inputId="category"
        label="Catégorie"
        error={errors.category?.message}
        required
      >
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <ControlledSelect
              id="category"
              placeholder="Fruits"
              value={field.value}
              onChange={field.onChange}
              options={CATEGORIES_ORDER.map((category) => ({
                label: category.name,
                value: category.name,
              }))}
            />
          )}
        />
      </FormInputContainer>
      <div className="flex gap-2">
        <FormInputContainer
          inputId="price"
          label="Prix"
          error={errors.price?.message}
          required
          className="flex-1"
        >
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input
                id="price"
                type="number"
                placeholder="5.99"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormInputContainer>
        <FormInputContainer
          inputId="quantity"
          label="Quantité"
          error={errors.quantity?.message}
          required
          className="flex-1"
        >
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <Input
                id="quantity"
                placeholder="100"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormInputContainer>
        <FormInputContainer
          inputId="unit"
          label="Unité"
          error={errors.unit?.message}
          required
          className="flex-1"
        >
          <Controller
            name="unit"
            control={control}
            render={({ field }) => (
              <UnitDropdown
                id="unit"
                placeholder="g"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormInputContainer>
      </div>
    </>
  );
};
