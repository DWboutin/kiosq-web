"use client";

import { forwardRef, PropsWithChildren, useImperativeHandle, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SideDrawerProps = {
  title: string;
  description: string;
  trigger: React.ReactNode;
  buttonSubmitLabel: string;
  buttonCancelLabel: string;
  handleSubmit: () => void;
  formHasErrors?: boolean;
} & PropsWithChildren;

export type SideDrawerRef = {
  isOpen: boolean;
  close: () => void;
  open: () => void;
};

export const SideDrawer = forwardRef<SideDrawerRef, SideDrawerProps>(
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
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      isOpen: open,
      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

    return (
      <Drawer open={open} onOpenChange={setOpen} direction="right" autoFocus={open}>
        <DrawerTrigger>{trigger}</DrawerTrigger>
        <DrawerContent className="data-[vaul-drawer-direction=right]:w-4/5 data-[vaul-drawer-direction=right]:sm:max-w-md data-[vaul-drawer-direction=right]:min-md:max-w-2xl">
          <DrawerHeader>
            <div className="flex flex-col justify-between gap-2 pb-4 border-b border-neutral-lightest">
              <DrawerTitle className="text-lg font-bold pt-1.5">{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </div>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto">{children}</div>
          <DrawerFooter>
            <div className="flex flex-row justify-end gap-2 pt-4 border-t border-neutral-lightest">
              <DrawerClose>
                <Button variant="outline" asChild>
                  <span>{buttonCancelLabel}</span>
                </Button>
              </DrawerClose>
              <Button onClick={handleSubmit} className={cn(formHasErrors && "animate-shake")}>
                {buttonSubmitLabel}
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
);

SideDrawer.displayName = "SideDrawer";
