"use client";

import { updateProductPublishedStatus } from "@/actions/update-product-published-status";
import { ButtonBrand } from "@/components/ui/button-brand";
import { EditPencilIcon } from "@/components/ui/icons/edit-pencil-icon";
import { PublishedStatusManagement } from "@/features/published-status-management/published-status-management";
import { PublishedStatus } from "@/types/app";
import { FC } from "react";
import { toast } from "sonner";

type AdminProductIdCtaProps = {
  productId: string;
  entityName: string;
  status: PublishedStatus;
};

export const AdminProductIdCta: FC<AdminProductIdCtaProps> = ({
  productId,
  entityName,
  status,
}) => {
  const handleStatusChange = async (status: PublishedStatus) => {
    try {
      const success = await updateProductPublishedStatus(productId, status);

      if (success) {
        toast.success("Status updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex flex-row gap-2">
      <PublishedStatusManagement
        status={status}
        entityName={entityName}
        onStatusChange={handleStatusChange}
      />
      <ButtonBrand>
        <span className="flex flex-row items-center gap-2">
          <EditPencilIcon className="size-5" />
          Modifier
        </span>
      </ButtonBrand>
    </div>
  );
};
