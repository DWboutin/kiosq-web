"use client";

import { FC } from "react";
import { SideFormDrawer } from "@/components/ui/side-form-drawer";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { useProductForm } from "@/features/product-form-drawer/hooks/use-product-form";
import { ProductFormChecklist } from "@/features/product-form-drawer/components/product-form-checklist";
import { ProductForm } from "@/features/product-form-drawer/components/product-form";
import { useTranslations } from "next-intl";
import { ButtonBrand } from "@/components/ui/button-brand";
import { EditPencilIcon } from "@/components/ui/icons/edit-pencil-icon";

type ProductFormDrawerProps = {
  editMode?: boolean;
  productId?: string;
};

export const ProductFormDrawer: FC<ProductFormDrawerProps> = ({ editMode = false, productId }) => {
  const t = useTranslations("ProductFormDrawer");
  const {
    selectors: { control, errors, fields, categoryValue, isSubmitting, drawerRef },
    actions: { handleFormSubmit, addChecklistItem, remove },
  } = useProductForm({ editMode, productId });
  const title = editMode ? t("editTitle") : t("addTitle");
  const description = editMode ? t("editDescription") : t("addDescription");
  const buttonSubmitLabel = editMode ? t("editButton") : t("addButton");

  return (
    <SideFormDrawer
      ref={drawerRef}
      title={title}
      description={description}
      buttonSubmitLabel={buttonSubmitLabel}
      buttonCancelLabel={t("cancelButton")}
      handleSubmit={handleFormSubmit}
      isSubmitting={isSubmitting}
      autoFocus={!editMode}
      trigger={
        <ButtonBrand tabIndex={-1} asChild>
          {!editMode ? (
            <span>
              <PlusSquareIcon className="size-5" />
              {t("openingButton")}
            </span>
          ) : (
            <span>
              <EditPencilIcon className="size-5" />
              {t("editButton")}
            </span>
          )}
        </ButtonBrand>
      }
    >
      <div className="flex flex-col gap-4">
        <ProductForm
          control={control}
          errors={errors}
          categoryValue={categoryValue}
          editMode={editMode}
        />
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
