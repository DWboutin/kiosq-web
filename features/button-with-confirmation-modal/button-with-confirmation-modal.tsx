import { Modal, ModalProps, ModalRef } from "@/components/ui/modal";
import {
  Children,
  cloneElement,
  FC,
  MouseEvent,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

// Helper type for data attributes
type DataAttributes = {
  [key: `data-${string}`]: string;
};

type ButtonWithConfirmationModalProps = {
  children: ReactElement<
    {
      onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
      loading?: boolean;
    } & DataAttributes
  >;
} & ModalProps;

/**
 * Convert a data-* attribute name to its DOM dataset equivalent
 * Example: data-row-id -> rowId
 */
const dataAttrToDatasetKey = (attr: string): string =>
  attr.replace(/^data-/, "").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

export const ButtonWithConfirmationModal: FC<ButtonWithConfirmationModalProps> = ({
  title,
  description,
  confirmLabel,
  cancelLabel,
  action,
  children,
  ...rest
}) => {
  const modalRef = useRef<ModalRef>(null);
  const [loading, setLoading] = useState(false);
  const childProps = Children.only(children).props;
  const dataAttributes = useMemo(
    () =>
      Object.entries(childProps)
        .filter(([key]) => key.startsWith("data-"))
        .reduce<Record<string, string>>((acc, [key, value]) => {
          const datasetKey = dataAttrToDatasetKey(key);
          return { ...acc, [datasetKey]: value as string };
        }, {}),
    [childProps]
  );

  const handleModalOpen = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    modalRef.current?.open();
  };

  const wrappedAction = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const newEvent = Object.create(e);
      newEvent.currentTarget = {
        ...e.currentTarget,
        dataset: {
          ...e.currentTarget.dataset,
          ...dataAttributes,
        },
      };

      setLoading(true);
      try {
        return await action(newEvent);
      } finally {
        setLoading(false);
      }
    },
    [action, dataAttributes]
  );

  return (
    <Modal
      ref={modalRef}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      action={wrappedAction}
      loading={loading}
      {...rest}
    >
      {cloneElement(Children.only(children), {
        onClick: handleModalOpen,
      })}
    </Modal>
  );
};
