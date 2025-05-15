"use client";

import { Button } from "@/components/ui/button";
import {
  DialogContent as BaseDialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import Image from "next/image";
import { useId } from "react";
import onboardingImage from "@/public/images/user-onboarding.png";
import * as DialogPrimitive from "@radix-ui/react-dialog";

// Custom DialogContent without close button
const DialogContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialogContent>) => (
  <DialogPortal>
    <DialogOverlay onClick={(e) => e.stopPropagation()} />
    <DialogPrimitive.Content
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
);

export const UserOnboarding = () => {
  const user = useUserStore((state) => state.user);
  const userData = useUserStore((state) => state.userData);
  const titleId = useId();
  const descriptionId = useId();

  if (!user || !userData) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn("p-0 overflow-hidden")}
      >
        <Image src={onboardingImage} alt="User Onboarding" />
        <DialogHeader className="border-b border-neutral-lightest flex flex-col justify-between gap-2 px-6 pt-2 pb-4">
          <DialogTitle id={titleId} className="text-base font-bold text-center">
            Welcome to the app!
          </DialogTitle>
          <DialogDescription id={descriptionId} className="text-center">
            We need to know a few things about you to continue. It will only take a few minutes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-4">
          <div className="flex flex-row justify-end gap-2">
            <Button>Continue</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
