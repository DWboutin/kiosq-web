"use client";

import {
  forwardRef,
  PropsWithChildren,
  useImperativeHandle,
  useState,
  useId,
  useEffect,
} from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { LoadingButton } from "@/components/ui/loading-button";
import { ButtonBrand } from "@/components/ui/button-brand";

type SideFormDrawerProps = {
  title: string;
  description: string;
  trigger: React.ReactNode;
  buttonSubmitLabel: string;
  buttonCancelLabel: string;
  handleSubmit: () => void;
  formHasErrors?: boolean;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  onStateChange?: (isOpen: boolean) => void;
} & PropsWithChildren;

export type SideFormDrawerRef = {
  isOpen: boolean;
  close: () => void;
  open: () => void;
};

export const SideFormDrawer = forwardRef<SideFormDrawerRef, SideFormDrawerProps>(
  (
    {
      children,
      title,
      description,
      trigger,
      buttonSubmitLabel,
      buttonCancelLabel,
      handleSubmit,
      formHasErrors,
      isSubmitting = false,
      autoFocus = true,
      onStateChange,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const titleId = useId();
    const descriptionId = useId();

    const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen);
      onStateChange?.(newOpen);
    };

    useImperativeHandle(ref, () => ({
      isOpen: open,
      open: () => {
        setOpen(true);
        onStateChange?.(true);
      },
      close: () => {
        setOpen(false);
        onStateChange?.(false);
      },
    }));

    useEffect(() => {
      onStateChange?.(open);
    }, [open]);

    return (
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        direction="right"
        autoFocus={autoFocus && open}
      >
        <DrawerTrigger asChild aria-haspopup="dialog" aria-expanded={open}>
          {trigger}
        </DrawerTrigger>
        <DrawerContent
          className="data-[vaul-drawer-direction=right]:w-4/5 data-[vaul-drawer-direction=right]:sm:max-w-md data-[vaul-drawer-direction=right]:min-md:max-w-2xl"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          role="dialog"
        >
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <DrawerHeader className="border-b border-neutral-lightest">
              <div className="flex flex-col justify-between gap-2 pb-2 min-md:pb-4">
                <DrawerTitle
                  id={titleId}
                  className="text-base min-md:text-lg font-bold pt-1 min-md:pt-1.5"
                >
                  {title}
                </DrawerTitle>
                <DrawerDescription id={descriptionId}>{description}</DrawerDescription>
              </div>
            </DrawerHeader>
            <div className="p-4 overflow-y-auto flex-1">{children}</div>
            <DrawerFooter className="border-t border-neutral-lightest">
              <div className="flex flex-row justify-end gap-2">
                <DrawerClose asChild>
                  <ButtonBrand variant="outline" type="button">
                    <span>{buttonCancelLabel}</span>
                  </ButtonBrand>
                </DrawerClose>
                <LoadingButton
                  type="submit"
                  className={cn(formHasErrors && "animate-shake")}
                  aria-disabled={formHasErrors}
                  isLoading={isSubmitting}
                >
                  {buttonSubmitLabel}
                </LoadingButton>
              </div>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }
);

SideFormDrawer.displayName = "SideFormDrawer";
