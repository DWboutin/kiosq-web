"use client";

import { updateProductPublishedStatus } from "@/actions/update-product-published-status";
import { ClockIcon } from "@/components/ui/icons/clock-icon";
import { LocaleFullDate } from "@/components/ui/locale-date";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { ProductFormDrawer } from "@/features/product-form-drawer/product-form-drawer";
import { PublishedStatusManagement } from "@/features/published-status-management/published-status-management";
import { PublishedStatus } from "@/types/app";
import { useProductsInvalidator } from "@/utils/invalidators-hooks/use-products-invalidator";
import { useFormatter, useTranslations } from "next-intl";
import { FC } from "react";
import { toast } from "sonner";

type AdminProductIdCtaProps = {
  productId: string;
  profileId: string;
  entityName: string;
  status: PublishedStatus;
  createdAt: string;
  updatedAt: string;
};

export const AdminProductIdCta: FC<AdminProductIdCtaProps> = ({
  productId,
  profileId,
  entityName,
  status,
  createdAt,
  updatedAt,
}) => {
  const t = useTranslations("AdminProductPage");
  const format = useFormatter();
  const dateTime = new Date(updatedAt);
  const formattedDate = format.dateTime(dateTime, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
  const { revalidate: revalidateProducts } = useProductsInvalidator();

  const handleStatusChange = async (status: PublishedStatus) => {
    try {
      const success = await updateProductPublishedStatus(productId, status);

      if (success) {
        revalidateProducts({ productId, profileId });
        toast.success("Status updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="w-full flex flex-col items-end gap-2">
      <div className="flex flex-row gap-2">
        <PublishedStatusManagement
          status={status}
          entityName={entityName}
          onStatusChange={handleStatusChange}
        />
        <ProductFormDrawer editMode productId={productId} />
      </div>
      <div className="flex flex-row justify-end items-center gap-2">
        <span className="text-sm font-inter italic text-neutral-darker">
          {t("createdAt")}{" "}
          <span className="font-bold">
            <LocaleFullDate date={createdAt} />
          </span>
        </span>
        <TooltipContainer content={`${t("updatedAt")}: ${formattedDate}`}>
          <span>
            <ClockIcon className="size-4 text-neutral-darker" />
          </span>
        </TooltipContainer>
      </div>
    </div>
  );
};
