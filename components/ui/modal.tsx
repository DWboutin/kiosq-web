"use client";

import {
  forwardRef,
  PropsWithChildren,
  useImperativeHandle,
  useState,
  useId,
  MouseEvent,
  MouseEventHandler,
} from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LoadingButton } from "@/components/ui/loading-button";
import { ButtonBrand } from "@/components/ui/button-brand";

export type ModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  action: (e: MouseEvent<HTMLButtonElement>) => Promise<void>;
  closeAction?: () => void;
  className?: string;
  hideFooter?: boolean;
  loading?: boolean;
  isDestructive?: boolean;
} & PropsWithChildren;

export type ModalRef = {
  isOpen: boolean;
  close: () => void;
  open: () => void;
};

export const Modal = forwardRef<ModalRef, ModalProps>(
  (
    {
      children,
      title,
      description,
      confirmLabel,
      cancelLabel,
      action,
      closeAction,
      className,
      isDestructive = false,
      hideFooter = false,
      loading = false,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const descriptionId = useId();

    useImperativeHandle(ref, () => ({
      isOpen: open,
      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

    const handleAction: MouseEventHandler<HTMLButtonElement> = async (e) => {
      e.stopPropagation();
      await action(e);
      setOpen(false);
    };

    const handleClose = () => {
      if (closeAction) {
        closeAction();
      }
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        {children && <DialogTrigger asChild>{children}</DialogTrigger>}
        <DialogContent
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className={cn("p-0 gap-0", className)}
        >
          <DialogHeader className="border-b border-neutral-lightest flex flex-col justify-between gap-2 py-6 px-6 pt-6">
            <DialogTitle id={titleId} className="text-base font-bold">
              {title}
            </DialogTitle>
            {description && <DialogDescription id={descriptionId}>{description}</DialogDescription>}
          </DialogHeader>
          {!hideFooter && (
            <DialogFooter className="p-4">
              <div className="flex flex-row justify-end gap-2">
                <DialogClose asChild onClick={(e) => e.stopPropagation()}>
                  <ButtonBrand variant="outline" type="button">
                    <span>{cancelLabel}</span>
                  </ButtonBrand>
                </DialogClose>
                <LoadingButton
                  type="submit"
                  variant={isDestructive ? "destructive" : "default"}
                  onClick={handleAction}
                  isLoading={loading}
                >
                  {loading ? `${confirmLabel}...` : confirmLabel}
                </LoadingButton>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

Modal.displayName = "Modal";
