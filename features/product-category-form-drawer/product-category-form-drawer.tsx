"use client";

import { FC, useRef } from "react";
import { SideDrawer, SideDrawerRef } from "@/components/ui/side-drawer";
import { Button } from "@/components/ui/button";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { ProductCategoryForm } from "@/features/product-category-form-drawer/components/product-category-form";
import { useProductCategoryForm } from "@/features/product-category-form-drawer/hooks/use-product-category-form";

export const ProductCategoryFormDrawer: FC = () => {
  const drawerRef = useRef<SideDrawerRef>(null);
  const {
    selectors: { control, errors },
    actions: { handleFormSubmit },
  } = useProductCategoryForm({
    onSuccess: () => {
      drawerRef.current?.close();
    },
  });

  return (
    <SideDrawer
      ref={drawerRef}
      title="Ajouter une catégorie pour les produits"
      description="Entrez les informations de la catégorie et cliquez sur 'Ajouter'."
      buttonSubmitLabel="Ajouter"
      buttonCancelLabel="Annuler"
      handleSubmit={handleFormSubmit}
      trigger={
        <Button tabIndex={-1} asChild>
          <span>
            <PlusSquareIcon className="size-5" />
            Ajouter une catégorie
          </span>
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <ProductCategoryForm control={control} errors={errors} />
      </div>
    </SideDrawer>
  );
};
