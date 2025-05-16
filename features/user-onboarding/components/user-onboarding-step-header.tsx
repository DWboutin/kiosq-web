import { FC } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface UserOnboardingStepHeaderProps {
  titleId: string;
  descriptionId: string;
  title: string;
  description: string;
}

export const UserOnboardingStepHeader: FC<UserOnboardingStepHeaderProps> = ({
  titleId,
  descriptionId,
  title,
  description,
}) => {
  return (
    <DialogHeader className="border-b border-neutral-lightest flex flex-col justify-between gap-2 px-6 py-4">
      <DialogTitle id={titleId} className="text-base font-bold text-center">
        {title}
      </DialogTitle>
      <DialogDescription id={descriptionId} className="text-center">
        {description}
      </DialogDescription>
    </DialogHeader>
  );
};
