"use client";

import { getUserProfiles } from "@/actions/get-user-profiles";
import { updateProductPublishedStatus } from "@/actions/update-product-published-status";
import { ClockIcon } from "@/components/ui/icons/clock-icon";
import { LocaleFullDate } from "@/components/ui/locale-date";
import { TooltipContainer } from "@/components/ui/tooltip-container";
import { ProductFormDrawer } from "@/features/product-form-drawer/product-form-drawer";
import { PublishedStatusManagement } from "@/features/published-status-management/published-status-management";
import { PublishedStatus } from "@/types/app";
import { cacheKeys } from "@/utils/cache-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { FC } from "react";
import { toast } from "sonner";

type AdminProductIdCtaProps = {
  productId: string;
  entityName: string;
  status: PublishedStatus;
  createdAt: string;
  updatedAt: string;
};

export const AdminProductIdCta: FC<AdminProductIdCtaProps> = ({
  productId,
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
  const queryClient = useQueryClient();

  const handleStatusChange = async (status: PublishedStatus) => {
    try {
      const success = await updateProductPublishedStatus(productId, status);
      const profiles = await getUserProfiles();

      if (success) {
        queryClient.invalidateQueries({
          queryKey: cacheKeys.currentUserProductById(productId).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: cacheKeys.currentUserProfileIdProducts.list(profiles[0]?.id).queryKey,
        });
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
