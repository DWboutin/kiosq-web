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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type ModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  action: (e: MouseEvent<HTMLButtonElement>) => Promise<void>;
  className?: string;
  hideFooter?: boolean;
  loading?: boolean;
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
      className,
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

    const onDelete: MouseEventHandler<HTMLButtonElement> = async (e) => {
      e.stopPropagation();
      await action(e);
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className={cn("p-0", className)}>
          <DialogHeader className="border-b border-neutral-lightest">
            <div className="flex flex-col justify-between gap-2 pb-2 px-6 pt-6">
              <DialogTitle id={titleId} className="text-base font-bold">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription id={descriptionId}>{description}</DialogDescription>
              )}
            </div>
          </DialogHeader>
          {!hideFooter && (
            <DialogFooter className="border-t border-neutral-lightest p-4">
              <div className="flex flex-row justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    <span>{cancelLabel}</span>
                  </Button>
                </DialogClose>
                <Button type="submit" variant="destructive" onClick={onDelete}>
                  {loading && <Loader2 className="animate-spin" />}
                  {loading ? `${confirmLabel}...` : confirmLabel}
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

Modal.displayName = "Modal";
