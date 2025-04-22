"use client";

import { FC, useRef, RefObject } from "react";
import { SideDrawer, SideDrawerRef } from "@/components/ui/side-drawer";
import { Button } from "@/components/ui/button";
import { PlusSquareIcon } from "@/components/ui/icons/plus-square-icon";
import { ProductCategoryForm } from "@/features/product-category-form-drawer/components/product-category-form";
import { useProductCategoryForm } from "@/features/product-category-form-drawer/hooks/use-product-category-form";
import { useTranslations } from "next-intl";

export const ProductCategoryFormDrawer: FC = () => {
  const t = useTranslations("ProductCategoryFormDrawer");
  const drawerRef = useRef<SideDrawerRef>(null);
  const {
    selectors: { control, errors, isUpdating },
    actions: { handleFormSubmit },
  } = useProductCategoryForm(drawerRef as RefObject<SideDrawerRef>);

  return (
    <SideDrawer
      ref={drawerRef}
      title={isUpdating ? t("editTitle") : t("addTitle")}
      description={isUpdating ? t("editDescription") : t("addDescription")}
      buttonSubmitLabel={isUpdating ? t("editButton") : t("addButton")}
      buttonCancelLabel={t("cancelButton")}
      handleSubmit={handleFormSubmit}
      trigger={
        <Button asChild>
          <span>
            <PlusSquareIcon className="size-5" />
            {t("openingButton")}
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
