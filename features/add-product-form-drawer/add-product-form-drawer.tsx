"use client";

import { FC } from "react";
import { SideDrawer } from "@/components/ui/side-drawer";
import { Button } from "@/components/ui/button";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { useAddProductForm } from "@/features/add-product-form-drawer/hooks/use-add-product-form";
import { AddProductFormChecklist } from "@/features/add-product-form-drawer/components/add-product-form-checklist";
import { AddProductForm } from "@/features/add-product-form-drawer/components/add-product-form";

export const AddProductFormDrawer: FC = () => {
  const {
    selectors: { control, errors, fields },
    actions: { handleFormSubmit, addChecklistItem, remove },
  } = useAddProductForm();

  return (
    <SideDrawer
      title="Ajouter un produit"
      description='Entrez les informations du produit et cliquez sur "Ajouter".'
      buttonSubmitLabel="Ajouter"
      buttonCancelLabel="Annuler"
      handleSubmit={handleFormSubmit}
      trigger={
        <Button tabIndex={-1}>
          <PlusSquareIcon className="size-5" />
          Ajouter un produit
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <AddProductForm control={control} errors={errors} />
        <AddProductFormChecklist
          fields={fields}
          addChecklistItem={addChecklistItem}
          remove={remove}
          control={control}
        />
      </div>
    </SideDrawer>
  );
};
