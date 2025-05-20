"use client";

import { FC } from "react";
import { SideFormDrawer } from "@/components/ui/side-form-drawer";
import { Button } from "@/components/ui/button";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { useProductForm } from "@/features/product-form-drawer/hooks/use-product-form";
import { ProductFormChecklist } from "@/features/product-form-drawer/components/product-form-checklist";
import { ProductForm } from "@/features/product-form-drawer/components/product-form";
import { useTranslations } from "next-intl";
export const ProductFormDrawer: FC = () => {
  const t = useTranslations("ProductFormDrawer");
  const {
    selectors: { control, errors, fields, categoryValue, isSubmitting },
    actions: { handleFormSubmit, addChecklistItem, remove },
  } = useProductForm();

  return (
    <SideFormDrawer
      title={t("addTitle")}
      description={t("addDescription")}
      buttonSubmitLabel={t("addButton")}
      buttonCancelLabel={t("cancelButton")}
      handleSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
      trigger={
        <Button tabIndex={-1} asChild>
          <span>
            <PlusSquareIcon className="size-5" />
            {t("openingButton")}
          </span>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <ProductForm control={control} errors={errors} categoryValue={categoryValue} />
        <ProductFormChecklist
          fields={fields}
          addChecklistItem={addChecklistItem}
          remove={remove}
          control={control}
          errors={errors}
        />
      </div>
    </SideFormDrawer>
  );
};
