"use client";

import { ControlledSelect } from "@/components/ui/form-utils/controlled-select";
import { Modal, ModalRef } from "@/components/ui/modal";
import { PublishedStatus } from "@/types/app";
import { useTranslations } from "next-intl";
import { FC, useEffect, useRef, useState } from "react";

type PublishedStatusManagementProps = {
  status: PublishedStatus;
  entityName: string;
  onStatusChange: (status: PublishedStatus) => Promise<void>;
};

export const PublishedStatusManagement: FC<PublishedStatusManagementProps> = ({
  status,
  onStatusChange,
  entityName,
}) => {
  const t = useTranslations();
  const [currentStatus, setCurrentStatus] = useState<PublishedStatus>(status);
  const modalRef = useRef<ModalRef>(null);

  useEffect(() => {
    if (currentStatus !== status) {
      modalRef.current?.open();
    }
  }, [currentStatus]);

  useEffect(() => {
    if (modalRef.current?.isOpen && currentStatus !== status) {
      setCurrentStatus(status);
    }
  }, [modalRef.current?.isOpen, currentStatus, status]);

  return (
    <div className="flex flex-row items-center gap-2">
      <span>{t("Global.status")}:</span>
      <ControlledSelect
        id="status"
        placeholder={t("Global.status")}
        value={currentStatus}
        onChange={(value) => setCurrentStatus(value as PublishedStatus)}
        options={[
          { label: t("Global.draft"), value: "draft" },
          { label: t("Global.published"), value: "published" },
          { label: t("Global.deleted"), value: "deleted" },
        ]}
      />
      <Modal
        ref={modalRef}
        title={t(`PublishedStatusManagement.modal_${currentStatus}_title`, {
          name: entityName,
        })}
        description={t(`PublishedStatusManagement.modal_${currentStatus}_description`, {
          name: entityName,
        })}
        confirmLabel={t(`PublishedStatusManagement.modal_${currentStatus}_action`)}
        cancelLabel={t("Global.cancel")}
        isDestructive={currentStatus === "deleted"}
        action={() => onStatusChange(currentStatus)}
        closeAction={() => {
          setCurrentStatus(status);
        }}
      />
    </div>
  );
};
