"use client";

import { FormInputContainer } from "@/components/ui/form-utils/form-input-container";
import { Input } from "@/components/ui/input";
import { Control, Controller } from "react-hook-form";
import { FieldErrors } from "react-hook-form";
import { FC } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ProductCategoryFormValues } from "@/features/product-category-form-drawer/hooks/use-product-category-form";
import { ControlledSelect } from "@/components/ui/form-utils/controlled-select";
import { AddTranslationField } from "@/features/add-translation-field/add-translation-field";
import { useTranslations } from "next-intl";

type ProductCategoryFormProps = {
  control: Control<ProductCategoryFormValues>;
  errors: FieldErrors<ProductCategoryFormValues>;
};

export const ProductCategoryForm: FC<ProductCategoryFormProps> = ({ control, errors }) => {
  const t = useTranslations("ProductCategoryForm");

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
        fieldType="textarea"
        errors={errors}
      />
      <FormInputContainer inputId="slug" label={t("slug")} error={errors.slug?.message} required>
        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <Input
              id="slug"
              placeholder={t("slugPlaceholder")}
              aria-invalid={!!errors.slug}
              {...field}
            />
          )}
        />
      </FormInputContainer>
      <AddTranslationField name="slug" control={control} errors={errors} />
      <FormInputContainer
        inputId="parentId"
        label={t("parent")}
        error={errors.parentId?.message}
        required
      >
        <Controller
          name="parentId"
          control={control}
          render={({ field }) => (
            <ControlledSelect
              id="parentId"
              placeholder={t("parentPlaceholder")}
              aria-invalid={!!errors.parentId}
              {...field}
              options={[
                {
                  label: t("noParentCategory"),
                  value: "false",
                },
              ]}
            />
          )}
        />
      </FormInputContainer>
      <FormInputContainer
        inputId="orderRank"
        label={t("orderRank")}
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
              placeholder={t("orderRankPlaceholder")}
              aria-invalid={!!errors.orderRank}
              {...field}
            />
          )}
        />
      </FormInputContainer>
    </>
  );
};
