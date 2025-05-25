"use client";

import { FC, useRef, RefObject } from "react";
import { SideFormDrawer, SideFormDrawerRef } from "@/components/ui/side-form-drawer";
import { Button } from "@/components/ui/button";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { ProductCategoryForm } from "@/features/product-category-form-drawer/components/product-category-form";
import { useProductCategoryForm } from "@/features/product-category-form-drawer/hooks/use-product-category-form";
import { useTranslations } from "next-intl";
import { ButtonBrand } from "@/components/ui/button-brand";

export const ProductCategoryFormDrawer: FC = () => {
  const t = useTranslations("ProductCategoryFormDrawer");
  const drawerRef = useRef<SideFormDrawerRef>(null);
  const {
    selectors: { control, errors, isUpdating, hasErrors },
    actions: { handleFormSubmit },
  } = useProductCategoryForm(drawerRef as RefObject<SideFormDrawerRef>);

  return (
    <SideFormDrawer
      ref={drawerRef}
      title={isUpdating ? t("editTitle") : t("addTitle")}
      description={isUpdating ? t("editDescription") : t("addDescription")}
      buttonSubmitLabel={isUpdating ? t("editButton") : t("addButton")}
      buttonCancelLabel={t("cancelButton")}
      handleSubmit={handleFormSubmit}
      formHasErrors={hasErrors}
      trigger={
        <ButtonBrand asChild>
          <span>
            <PlusSquareIcon className="size-5" />
            {t("openingButton")}
          </span>
        </ButtonBrand>
      }
    >
      <div className="flex flex-col gap-5">
        <ProductCategoryForm control={control} errors={errors} />
      </div>
    </SideFormDrawer>
  );
};
