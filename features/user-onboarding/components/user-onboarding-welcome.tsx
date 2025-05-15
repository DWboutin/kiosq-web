import { FC } from "react";
import Image from "next/image";
import onboardingImage from "@/public/images/user-onboarding.png";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface UserOnboardingWelcomeProps {
  titleId: string;
  descriptionId: string;
}

export const UserOnboardingWelcome: FC<UserOnboardingWelcomeProps> = ({
  titleId,
  descriptionId,
}) => {
  return (
    <>
      <Image src={onboardingImage} alt="User Onboarding" />
      <DialogHeader className="border-b border-neutral-lightest flex flex-col justify-between gap-2 px-6 py-4">
        <DialogTitle id={titleId} className="text-base font-bold text-center">
          Welcome to the app!
        </DialogTitle>
        <DialogDescription id={descriptionId} className="text-center">
          We need to know a few things about you to continue. By completing this quick onboarding
          process, we can provide you with personalized content and offers that match your
          interests.
        </DialogDescription>
      </DialogHeader>
    </>
  );
};
