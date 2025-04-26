"use client";

import { FC } from "react";
import { SideDrawer } from "@/components/ui/side-form-drawer";
import { Button } from "@/components/ui/button";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { useProductForm } from "@/features/product-form-drawer/hooks/use-product-form";
import { ProductFormChecklist } from "@/features/product-form-drawer/components/product-form-checklist";
import { ProductForm } from "@/features/product-form-drawer/components/product-form";

export const ProductFormDrawer: FC = () => {
  const {
    selectors: { control, errors, fields },
    actions: { handleFormSubmit, addChecklistItem, remove },
  } = useProductForm();

  return (
    <SideDrawer
      title="Ajouter un produit"
      description='Entrez les informations du produit et cliquez sur "Ajouter".'
      buttonSubmitLabel="Ajouter"
      buttonCancelLabel="Annuler"
      handleSubmit={handleFormSubmit}
      trigger={
        <Button tabIndex={-1} asChild>
          <span>
            <PlusSquareIcon className="size-5" />
            Ajouter un produit
          </span>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <ProductForm control={control} errors={errors} />
        <ProductFormChecklist
          fields={fields}
          addChecklistItem={addChecklistItem}
          remove={remove}
          control={control}
        />
      </div>
    </SideDrawer>
  );
};
