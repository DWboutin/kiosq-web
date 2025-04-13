"use client";

import { FC } from "react";
import { SideDrawer } from "@/components/ui/side-drawer";
import { Button } from "@/components/ui/button";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";

export const AddProductFormDrawer: FC = () => {
  return (
    <SideDrawer
      title="Ajouter un produit"
      description='Entrez les informations du produit et cliquez sur "Ajouter".'
      buttonSubmitLabel="Ajouter"
      buttonCancelLabel="Annuler"
      handleSubmit={() => {}}
      trigger={
        <Button tabIndex={-1}>
          <PlusSquareIcon className="size-5" />
          Ajouter un produit
        </Button>
      }
    >
      <div>hello</div>
    </SideDrawer>
  );
};
