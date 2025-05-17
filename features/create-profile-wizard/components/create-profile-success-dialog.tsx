import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { FC, useId } from "react";
import newVendorProfileImage from "@/public/images/new-vendor-profile.png";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CreateProfileSuccessDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateProduct: () => void;
};

export const CreateProfileSuccessDialog: FC<CreateProfileSuccessDialogProps> = ({
  isOpen,
  onClose,
  onCreateProduct,
}) => {
  const t = useTranslations("CreateProfileWizard");
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn("p-0 overflow-hidden")}
      >
        <Image src={newVendorProfileImage} alt={t("creationSuccess")} />
        <DialogHeader className="border-b border-neutral-lightest flex flex-col justify-between gap-2 px-6 py-4">
          <DialogTitle id={titleId} className="text-base font-bold text-center">
            {t("creationSuccess")}
          </DialogTitle>
          <DialogDescription id={descriptionId} className="text-center">
            {t("creationSuccessDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-4">
          <div className="flex flex-row justify-end gap-2">
            <DialogClose asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" type="button">
                <span>{t("creationSuccessClose")}</span>
              </Button>
            </DialogClose>
            <Button type="button" onClick={onCreateProduct}>
              {t("creationSuccessButton")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
