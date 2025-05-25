import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { UnitDropdown } from "@/components/ui/form-utils/unit-dropdown";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { FieldErrors, Control } from "react-hook-form";
import { FC } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CategoriesSelect } from "@/features/categories-select/categories-select";
import { useTranslations } from "next-intl";
import { AddTranslationField } from "@/features/add-translation-field/add-translation-field";
import { ProductFormValues } from "@/features/product-form-drawer/utils/product-form-validation-schema";

type ProductFormProps = {
  categoryValue: string;
  control: Control<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
};

export const ProductForm: FC<ProductFormProps> = ({ control, errors, categoryValue }) => {
  const t = useTranslations("ProductForm");

  return (
    <>
      <FormInputContainer inputId="name" label={t("name")} error={errors.name?.message} required>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="name"
              placeholder={t("namePlaceholder")}
              aria-invalid={!!errors.name}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField name="name" control={control} errors={errors} />
      <FormInputContainer
        inputId="description"
        label={t("description")}
        error={errors.description?.message}
        required
      >
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              id="description"
              placeholder={t("descriptionPlaceholder")}
              aria-invalid={!!errors.description}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField
        name="description"
        control={control}
        errors={errors}
        fieldType="textarea"
      />
      <FormInputContainer
        inputId="category"
        label={t("category")}
        error={errors.category?.message}
        required
      >
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <CategoriesSelect
              id="category"
              placeholder={t("categoryPlaceholder")}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </FormInputContainer>
      <FormInputContainer
        inputId="subcategory"
        label={t("subcategory")}
        error={errors.subcategory?.message}
        required
      >
        <Controller
          name="subcategory"
          control={control}
          render={({ field }) => (
            <CategoriesSelect
              id="subcategory"
              placeholder={
                categoryValue ? t("subcategoryPlaceholder") : t("subcategoryNoParentPlaceholder")
              }
              value={field.value}
              onChange={field.onChange}
              parentId={categoryValue}
              disabled={!categoryValue}
            />
          )}
        />
      </FormInputContainer>
      <div className="flex gap-2">
        <FormInputContainer
          inputId="price"
          label={t("price")}
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
                placeholder={t("pricePlaceholder")}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormInputContainer>
        <FormInputContainer
          inputId="quantity"
          label={t("quantity")}
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
                placeholder={t("quantityPlaceholder")}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormInputContainer>
        <FormInputContainer
          inputId="unit"
          label={t("unit")}
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
                placeholder={t("unitPlaceholder")}
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
