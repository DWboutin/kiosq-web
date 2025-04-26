import { Modal, ModalProps, ModalRef } from "@/components/ui/modal";
import { Children, cloneElement, FC, MouseEvent, ReactElement, useRef } from "react";

type DeleteButtonWithConfirmationModalProps = {
  children: ReactElement<{ onClick?: (e: MouseEvent<HTMLButtonElement>) => void }>;
} & ModalProps;

export const DeleteButtonWithConfirmationModal: FC<DeleteButtonWithConfirmationModalProps> = ({
  title,
  description,
  buttonDeleteLabel,
  buttonCancelLabel,
  action,
  children,
  ...rest
}) => {
  const modalRef = useRef<ModalRef>(null);
  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("handleModalOpen");
    modalRef.current?.open();
  };

  return (
    <Modal
      ref={modalRef}
      title={title}
      description={description}
      buttonDeleteLabel={buttonDeleteLabel}
      buttonCancelLabel={buttonCancelLabel}
      action={action}
      {...rest}
    >
      {cloneElement(Children.only(children), {
        onClick: handleModalOpen,
      })}
    </Modal>
  );
};
